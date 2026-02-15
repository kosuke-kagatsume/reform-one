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

// ユーザー向け: 電子版新聞 詳細API（PDF URL取得）
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'IDが必要です')
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    // ユーザーの組織を取得
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: auth.userId }
    })

    if (!userOrg) {
      return error(res, ErrorCodes.FORBIDDEN, '組織に所属していません')
    }

    // アクセス権限を確認
    const access = await prisma.digitalNewspaperAccess.findUnique({
      where: { organizationId: userOrg.organizationId }
    })

    if (!access || access.userId !== auth.userId) {
      return error(res, ErrorCodes.FORBIDDEN, '電子版へのアクセス権限がありません')
    }

    // 電子版を取得
    const edition = await prisma.digitalNewspaperEdition.findUnique({
      where: { id }
    })

    if (!edition) {
      return error(res, ErrorCodes.NOT_FOUND, '電子版が見つかりません')
    }

    if (!edition.isPublished) {
      return error(res, ErrorCodes.FORBIDDEN, 'この電子版は公開されていません')
    }

    return success(res, { edition })
  } catch (err) {
    console.error('Digital newspaper detail API error:', err)
    return internalError(res)
  }
}
