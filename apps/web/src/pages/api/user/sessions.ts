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
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get current session token from cookie or header
    const currentSessionToken = req.cookies?.sessionToken || req.headers['x-session-token']

    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt.toISOString(),
      lastAccessedAt: session.updatedAt.toISOString(),
      userAgent: (session as unknown as { userAgent?: string }).userAgent || 'Unknown',
      ipAddress: (session as unknown as { ipAddress?: string }).ipAddress || 'Unknown',
      isCurrent: session.sessionToken === currentSessionToken
    }))

    return success(res, { sessions: formattedSessions })
  } catch (err) {
    console.error('Get sessions error:', err)
    return internalError(res)
  }
}
