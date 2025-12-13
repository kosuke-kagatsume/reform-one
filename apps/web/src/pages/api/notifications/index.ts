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
    // Notification model is not yet implemented - return empty for now
    // TODO: Add Notification model to schema and implement properly
    return success(res, {
      notifications: [],
      unreadCount: 0
    })
  } catch (err) {
    console.error('Get notifications error:', err)
    return internalError(res)
  }
}
