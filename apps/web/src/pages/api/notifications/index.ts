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
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    })

    return success(res, {
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString()
      })),
      unreadCount
    })
  } catch (err) {
    console.error('Get notifications error:', err)
    return internalError(res)
  }
}
