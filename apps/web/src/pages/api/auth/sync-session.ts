import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { success, error, methodNotAllowed, ErrorCodes } from '@/lib/api-response'

/**
 * Sync session cookie for users who logged in before cookie-based auth was added
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  const { userId } = req.body

  if (!userId || typeof userId !== 'string') {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ユーザーIDが必要です')
  }

  try {
    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      return error(res, ErrorCodes.NOT_FOUND, 'ユーザーが見つかりません')
    }

    // Set session cookie
    res.setHeader('Set-Cookie', `premier_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)

    return success(res, { synced: true }, 'セッションを同期しました')
  } catch (err) {
    console.error('Sync session error:', err)
    return error(res, ErrorCodes.INTERNAL_ERROR, 'セッションの同期に失敗しました')
  }
}
