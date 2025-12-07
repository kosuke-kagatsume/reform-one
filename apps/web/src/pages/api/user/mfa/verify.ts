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

// TOTP verification
function verifyTOTP(secret: string, token: string): boolean {
  const time = Math.floor(Date.now() / 1000 / 30)

  // Check current time window and one before/after for clock drift
  for (let i = -1; i <= 1; i++) {
    const expectedToken = generateTOTP(secret, time + i)
    if (expectedToken === token) {
      return true
    }
  }

  return false
}

function generateTOTP(secret: string, time: number): string {
  // Decode base32 secret
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const char of secret.toUpperCase()) {
    const val = base32Chars.indexOf(char)
    if (val === -1) continue
    bits += val.toString(2).padStart(5, '0')
  }

  const bytes = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2))
  }
  const key = Buffer.from(bytes)

  // Create time buffer
  const timeBuffer = Buffer.alloc(8)
  timeBuffer.writeBigInt64BE(BigInt(time))

  // HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key)
  hmac.update(timeBuffer)
  const hash = hmac.digest()

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0xf
  const binary = (
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  )

  const otp = binary % 1000000
  return otp.toString().padStart(6, '0')
}

function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
  }
  return codes
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  const { userId, code } = req.body

  if (!userId || !code) {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, '必須項目が不足しています')
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

    if (!user.mfaSecret) {
      return error(res, ErrorCodes.VALIDATION_ERROR, '二要素認証の設定が開始されていません')
    }

    if (!verifyTOTP(user.mfaSecret, code)) {
      return error(res, ErrorCodes.VALIDATION_ERROR, '認証コードが正しくありません')
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10)

    // Hash and store backup codes
    await prisma.mfaBackupCode.deleteMany({
      where: { userId }
    })

    for (const plainCode of backupCodes) {
      const hashedCode = crypto.createHash('sha256').update(plainCode).digest('hex')
      await prisma.mfaBackupCode.create({
        data: {
          userId,
          code: hashedCode
        }
      })
    }

    // Enable MFA
    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true }
    })

    // Log the MFA enablement
    const userOrg = user.organizations[0]
    if (userOrg) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          orgId: userOrg.organization.id,
          action: 'user.mfa_enabled',
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      })
    }

    return success(res, { backupCodes }, '二要素認証を有効にしました')
  } catch (err) {
    console.error('MFA verify error:', err)
    return internalError(res)
  }
}
