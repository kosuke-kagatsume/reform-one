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

// ユーザー向け: 電子版新聞API
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
      where: { userId: auth.userId }
    })

    if (!userOrg) {
      return error(res, ErrorCodes.FORBIDDEN, '組織に所属していません')
    }

    // アクセス権限を確認
    const access = await prisma.digitalNewspaperAccess.findUnique({
      where: { organizationId: userOrg.organizationId }
    })

    const hasAccess = access?.userId === auth.userId

    if (!hasAccess) {
      // アクセス権限がない場合はアクセス権情報のみ返す
      let accessUserName = null
      if (access) {
        const accessUser = await prisma.user.findUnique({
          where: { id: access.userId },
          select: { name: true }
        })
        accessUserName = accessUser?.name
      }

      return success(res, {
        hasAccess: false,
        accessGrantedTo: accessUserName,
        editions: []
      })
    }

    // アクセス権限がある場合は電子版一覧を返す
    const editions = await prisma.digitalNewspaperEdition.findMany({
      where: { isPublished: true },
      orderBy: { issueDate: 'desc' },
      select: {
        id: true,
        title: true,
        issueDate: true,
        thumbnailUrl: true,
        pageCount: true,
        description: true
      }
    })

    return success(res, {
      hasAccess: true,
      editions
    })
  } catch (err) {
    console.error('Digital newspaper API error:', err)
    return internalError(res)
  }
}
