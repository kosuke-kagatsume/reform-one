import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
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

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    // ユーザーの組織を取得
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: auth.userId },
      include: { organization: true }
    })

    if (!userOrg) {
      return success(res, { contact: null })
    }

    // TODO: 実際には組織に紐づいた担当営業をDBから取得する
    // 現状はデモ用のデフォルト値を返す
    const contact = {
      name: '山田 太郎',
      email: 'support@reform.co.jp',
      phone: '03-3235-9824'
    }

    return success(res, { contact })
  } catch (err) {
    console.error('Get sales contact error:', err)
    return internalError(res)
  }
}
