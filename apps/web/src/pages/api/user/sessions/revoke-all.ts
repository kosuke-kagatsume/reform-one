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
    // Get current session token from cookie or header
    const currentSessionToken = req.cookies?.sessionToken || req.headers['x-session-token']

    // Delete all sessions except the current one
    const deleteResult = await prisma.session.deleteMany({
      where: {
        userId,
        sessionToken: {
          not: currentSessionToken as string
        }
      }
    })

    // Log the bulk session revocation
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

    const userOrg = user?.organizations[0]
    if (userOrg) {
      await prisma.auditLog.create({
        data: {
          userId,
          orgId: userOrg.organization.id,
          action: 'user.sessions_revoked_all',
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent'],
          metadata: JSON.stringify({ count: deleteResult.count })
        }
      })
    }

    return success(res, { count: deleteResult.count }, `${deleteResult.count}件のセッションを終了しました`)
  } catch (err) {
    console.error('Revoke all sessions error:', err)
    return internalError(res)
  }
}
