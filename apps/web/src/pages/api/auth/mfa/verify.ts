import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import * as OTPAuth from 'otpauth'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
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

    const { code } = req.body

    if (!code) {
      return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, '認証コードは必須です', { field: 'code' })
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    })

    if (!user) {
      return error(res, ErrorCodes.USER_NOT_FOUND, 'ユーザーが見つかりません')
    }

    if (!user.mfaSecret) {
      return error(res, ErrorCodes.MFA_NOT_ENABLED, '2要素認証のセットアップが完了していません')
    }

    // TOTPを検証
    const totp = new OTPAuth.TOTP({
      issuer: 'Reform One',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.mfaSecret),
    })

    const delta = totp.validate({ token: code, window: 1 })

    if (delta === null) {
      return error(res, ErrorCodes.INVALID_CODE, '認証コードが正しくありません')
    }

    // 2要素認証を有効化
    if (!user.mfaEnabled) {
      // バックアップコードを生成
      const backupCodes: string[] = []
      for (let i = 0; i < 10; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase()
        backupCodes.push(code)

        const hashedCode = await bcrypt.hash(code, 10)
        await prisma.mfaBackupCode.create({
          data: {
            userId: user.id,
            code: hashedCode,
          },
        })
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { mfaEnabled: true },
      })

      // 監査ログを記録
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'user.mfa_enabled',
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent'],
        },
      })

      return success(res, {
        backupCodes,
        warning: 'バックアップコードは安全な場所に保管してください。このコードは二度と表示されません。',
      }, '2要素認証が有効になりました')
    }

    return success(res, { verified: true }, '認証に成功しました')
  } catch (err) {
    console.error('MFA verify error:', err)
    return internalError(res)
  }
}
