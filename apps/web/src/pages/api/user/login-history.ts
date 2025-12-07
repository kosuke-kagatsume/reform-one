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
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ユーザーIDが必要です')
  }

  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId,
        action: {
          in: ['user.login', 'user.logout', 'user.login_failed', 'user.password_changed']
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 20
    })

    const history = auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      ip: log.ip || 'Unknown',
      userAgent: log.userAgent || 'Unknown',
      createdAt: log.timestamp.toISOString(),
      success: !log.action.includes('failed')
    }))

    return success(res, { history })
  } catch (err) {
    console.error('Get login history error:', err)
    return internalError(res)
  }
}
