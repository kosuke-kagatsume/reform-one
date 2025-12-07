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
  if (req.method !== 'PATCH') {
    return methodNotAllowed(res, ['PATCH'])
  }

  const { id } = req.query
  const { userId } = req.body

  if (!id || typeof id !== 'string') {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, '通知IDが必要です')
  }

  if (!userId) {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ユーザーIDが必要です')
  }

  try {
    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    })

    if (!notification) {
      return error(res, ErrorCodes.NOT_FOUND, '通知が見つかりません')
    }

    // Mark as read
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    })

    return success(res, null, '既読にしました')
  } catch (err) {
    console.error('Mark notification read error:', err)
    return internalError(res)
  }
}
