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

  const { userId, name } = req.body

  if (!userId) {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ユーザーIDは必須です', { field: 'userId' })
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name }
    })

    return success(res, { user }, 'プロフィールを更新しました')
  } catch (err) {
    console.error('Update profile error:', err)
    return internalError(res)
  }
}
