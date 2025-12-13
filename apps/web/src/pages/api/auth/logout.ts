import type { NextApiRequest, NextApiResponse } from 'next'
import { success, methodNotAllowed } from '@/lib/api-response'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  // Clear session cookie
  res.setHeader('Set-Cookie', 'premier_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')

  return success(res, null, 'ログアウトしました')
}
