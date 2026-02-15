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

// 管理者用: 電子版新聞 一覧・作成API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.userType !== 'EMPLOYEE') {
      return error(res, ErrorCodes.UNAUTHORIZED, '管理者権限が必要です')
    }

    // GET: 一覧取得
    if (req.method === 'GET') {
      const editions = await prisma.digitalNewspaperEdition.findMany({
        orderBy: { issueDate: 'desc' }
      })

      const stats = {
        total: editions.length,
        published: editions.filter(e => e.isPublished).length
      }

      return success(res, { editions, stats })
    }

    // POST: 新規作成
    if (req.method === 'POST') {
      const {
        title,
        issueDate,
        pdfUrl,
        thumbnailUrl,
        pageCount,
        description,
        isPublished
      } = req.body

      if (!title || !issueDate || !pdfUrl) {
        return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'タイトル、発行日、PDF URLは必須です')
      }

      const edition = await prisma.digitalNewspaperEdition.create({
        data: {
          title,
          issueDate: new Date(issueDate),
          pdfUrl,
          thumbnailUrl,
          pageCount: pageCount ? parseInt(pageCount, 10) : null,
          description,
          isPublished: isPublished ?? false
        }
      })

      // 操作ログ
      await prisma.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'digital_newspaper.create',
          resource: edition.id,
          metadata: JSON.stringify({ title })
        }
      })

      return success(res, { edition }, '電子版を作成しました')
    }

    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (err) {
    console.error('Digital newspaper editions API error:', err)
    return internalError(res)
  }
}
