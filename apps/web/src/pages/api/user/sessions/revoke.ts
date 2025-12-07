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

  const { userId, sessionId } = req.body

  if (!userId || !sessionId) {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, '必須項目が不足しています')
  }

  try {
    // Verify the session belongs to the user
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId
      }
    })

    if (!session) {
      return error(res, ErrorCodes.NOT_FOUND, 'セッションが見つかりません')
    }

    // Delete the session
    await prisma.session.delete({
      where: { id: sessionId }
    })

    // Log the session revocation
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
          action: 'user.session_revoked',
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      })
    }

    return success(res, null, 'セッションを終了しました')
  } catch (err) {
    console.error('Revoke session error:', err)
    return internalError(res)
  }
}
