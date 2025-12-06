import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import * as OTPAuth from 'otpauth'
import {
  success,
  error,
  methodNotAllowed,
  unauthorized,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return unauthorized(res)
    }

    const { password, code } = req.body

    if (!password) {
      return error(
        res,
        ErrorCodes.MISSING_REQUIRED_FIELD,
        'パスワードは必須です',
        { field: 'password' }
      )
    }

    if (!code) {
      return error(
        res,
        ErrorCodes.MISSING_REQUIRED_FIELD,
        '認証コードは必須です',
        { field: 'code' }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    })

    if (!user) {
      return error(res, ErrorCodes.USER_NOT_FOUND, 'ユーザーが見つかりません')
    }

    if (!user.mfaEnabled) {
      return error(res, ErrorCodes.MFA_NOT_ENABLED, '2要素認証は有効ではありません')
    }

    if (!user.password) {
      return error(res, ErrorCodes.INVALID_PASSWORD, 'パスワードが設定されていません')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return error(res, ErrorCodes.INVALID_PASSWORD, 'パスワードが正しくありません')
    }

    if (!user.mfaSecret) {
      return error(res, ErrorCodes.MFA_NOT_ENABLED, 'MFA設定が見つかりません')
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'ReformOne',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.mfaSecret),
    })

    const delta = totp.validate({ token: code, window: 1 })
    if (delta === null) {
      const backupCode = await prisma.mfaBackupCode.findFirst({
        where: {
          userId: user.id,
          code: code,
          usedAt: null,
        },
      })

      if (!backupCode) {
        return error(res, ErrorCodes.INVALID_CODE, '認証コードが正しくありません')
      }

      await prisma.mfaBackupCode.update({
        where: { id: backupCode.id },
        data: { usedAt: new Date() },
      })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
        },
      }),
      prisma.mfaBackupCode.deleteMany({
        where: { userId: user.id },
      }),
    ])

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.mfa_disabled',
        ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    })

    return success(res, null, '2要素認証が無効になりました')
  } catch (err) {
    console.error('MFA disable error:', err)
    return internalError(res)
  }
}
