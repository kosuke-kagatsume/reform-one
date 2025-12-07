import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  const { userId, currentPassword, newPassword } = req.body

  if (!userId || !currentPassword || !newPassword) {
    return error(
      res,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      '必須項目が不足しています',
      { fields: ['userId', 'currentPassword', 'newPassword'] }
    )
  }

  // Validate new password
  if (newPassword.length < 8) {
    return error(res, ErrorCodes.VALIDATION_ERROR, 'パスワードは8文字以上必要です')
  }

  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return error(res, ErrorCodes.VALIDATION_ERROR, 'パスワードには大文字、小文字、数字を含めてください')
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return error(res, ErrorCodes.NOT_FOUND, 'ユーザーが見つかりません')
    }

    if (!user.password) {
      return error(res, ErrorCodes.VALIDATION_ERROR, 'パスワードが設定されていません')
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return error(res, ErrorCodes.INVALID_CREDENTIALS, '現在のパスワードが正しくありません')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    // Log the password change
    const userOrg = user.organizations[0]
    if (userOrg) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          orgId: userOrg.organization.id,
          action: 'user.password_changed',
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      })
    }

    return success(res, null, 'パスワードを変更しました')
  } catch (err) {
    console.error('Change password error:', err)
    return internalError(res)
  }
}
