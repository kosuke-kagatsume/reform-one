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
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })

    return success(res, { count: result.count }, `${result.count}件の通知を既読にしました`)
  } catch (err) {
    console.error('Mark all notifications read error:', err)
    return internalError(res)
  }
}
