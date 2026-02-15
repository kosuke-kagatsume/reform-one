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

// 管理者用: 電子版新聞 詳細・更新・削除API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'IDが必要です')
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.userType !== 'EMPLOYEE') {
      return error(res, ErrorCodes.UNAUTHORIZED, '管理者権限が必要です')
    }

    // GET: 詳細取得
    if (req.method === 'GET') {
      const edition = await prisma.digitalNewspaperEdition.findUnique({
        where: { id }
      })

      if (!edition) {
        return error(res, ErrorCodes.NOT_FOUND, '電子版が見つかりません')
      }

      return success(res, { edition })
    }

    // PUT: 更新
    if (req.method === 'PUT') {
      const {
        title,
        issueDate,
        pdfUrl,
        thumbnailUrl,
        pageCount,
        description,
        isPublished
      } = req.body

      const existing = await prisma.digitalNewspaperEdition.findUnique({ where: { id } })
      if (!existing) {
        return error(res, ErrorCodes.NOT_FOUND, '電子版が見つかりません')
      }

      const edition = await prisma.digitalNewspaperEdition.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          issueDate: issueDate ? new Date(issueDate) : existing.issueDate,
          pdfUrl: pdfUrl ?? existing.pdfUrl,
          thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existing.thumbnailUrl,
          pageCount: pageCount !== undefined ? (pageCount ? parseInt(pageCount, 10) : null) : existing.pageCount,
          description: description !== undefined ? description : existing.description,
          isPublished: isPublished !== undefined ? isPublished : existing.isPublished
        }
      })

      // 操作ログ
      await prisma.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'digital_newspaper.update',
          resource: id,
          metadata: JSON.stringify({ title: edition.title })
        }
      })

      return success(res, { edition }, '電子版を更新しました')
    }

    // DELETE: 削除
    if (req.method === 'DELETE') {
      const existing = await prisma.digitalNewspaperEdition.findUnique({ where: { id } })
      if (!existing) {
        return error(res, ErrorCodes.NOT_FOUND, '電子版が見つかりません')
      }

      await prisma.digitalNewspaperEdition.delete({ where: { id } })

      // 操作ログ
      await prisma.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'digital_newspaper.delete',
          resource: id,
          metadata: JSON.stringify({ title: existing.title })
        }
      })

      return success(res, null, '電子版を削除しました')
    }

    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
  } catch (err) {
    console.error('Digital newspaper edition API error:', err)
    return internalError(res)
  }
}
