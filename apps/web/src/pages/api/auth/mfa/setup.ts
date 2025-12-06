import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import crypto from 'crypto'
import * as OTPAuth from 'otpauth'
import {
  success,
  error,
  methodNotAllowed,
  unauthorized,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

// TOTPシークレット生成用のヘルパー
function generateSecret(): string {
  return crypto.randomBytes(20).toString('base64')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return unauthorized(res)
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    })

    if (!user) {
      return error(res, ErrorCodes.USER_NOT_FOUND, 'ユーザーが見つかりません')
    }

    if (user.mfaEnabled) {
      return error(res, ErrorCodes.MFA_ALREADY_ENABLED, '2要素認証は既に有効です')
    }

    // TOTPシークレットを生成
    const secret = generateSecret()

    // OTPAuthオブジェクトを作成
    const totp = new OTPAuth.TOTP({
      issuer: 'Reform One',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(Buffer.from(secret).toString('base64').replace(/[^A-Z2-7]/gi, '').slice(0, 32)),
    })

    // Base32エンコードされたシークレット
    const base32Secret = totp.secret.base32

    // QRコード用のotpauth URI
    const otpauthUrl = totp.toString()

    // シークレットを一時的に保存（まだ有効化しない）
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: base32Secret },
    })

    return success(res, {
      secret: base32Secret,
      otpauthUrl,
    }, '2要素認証のセットアップを開始しました。認証アプリでQRコードをスキャンしてください。')
  } catch (err) {
    console.error('MFA setup error:', err)
    return internalError(res)
  }
}
