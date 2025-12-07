import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

// Generate a base32 encoded secret
function generateSecret(): string {
  const buffer = crypto.randomBytes(20)
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''

  for (let i = 0; i < buffer.length; i++) {
    secret += base32Chars[buffer[i] % 32]
  }

  return secret
}

// Generate QR code data URL
function generateQRCodeURL(secret: string, email: string, issuer: string): string {
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`

  // Using a simple QR code API for now
  // In production, you might want to use a library like qrcode
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
}

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
      where: { id: userId }
    })

    if (!user) {
      return error(res, ErrorCodes.NOT_FOUND, 'ユーザーが見つかりません')
    }

    if (user.mfaEnabled) {
      return error(res, ErrorCodes.VALIDATION_ERROR, '二要素認証は既に有効です')
    }

    const secret = generateSecret()
    const qrCode = generateQRCodeURL(secret, user.email, 'Reform One')

    // Store the secret temporarily (will be confirmed when user verifies)
    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret }
    })

    return success(res, { qrCode, secret })
  } catch (err) {
    console.error('MFA setup error:', err)
    return internalError(res)
  }
}
