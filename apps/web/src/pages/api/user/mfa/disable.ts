import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
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

  const { userId } = req.body

  if (!userId) {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ユーザーIDが必要です')
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

    if (!user.mfaEnabled) {
      return error(res, ErrorCodes.VALIDATION_ERROR, '二要素認証は既に無効です')
    }

    // Delete backup codes
    await prisma.mfaBackupCode.deleteMany({
      where: { userId }
    })

    // Disable MFA
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null
      }
    })

    // Log the MFA disablement
    const userOrg = user.organizations[0]
    if (userOrg) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          orgId: userOrg.organization.id,
          action: 'user.mfa_disabled',
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      })
    }

    return success(res, null, '二要素認証を無効にしました')
  } catch (err) {
    console.error('MFA disable error:', err)
    return internalError(res)
  }
}
