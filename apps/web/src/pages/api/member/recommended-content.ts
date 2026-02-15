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

    // ユーザーの視聴履歴を取得
    const viewedArchiveIds = await prisma.archiveView.findMany({
      where: { userId: auth.userId },
      select: { archiveId: true }
    }).then(views => views.map(v => v.archiveId))

    // 最新のアーカイブを取得（視聴済みかどうかの情報付き）
    const recentArchives = await prisma.archive.findMany({
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        recommendReason: true,
        category: { select: { name: true } }
      }
    })

    // 最新のデータブックを取得
    const recentDatabook = await prisma.databook.findFirst({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true
      }
    })

    // おすすめコンテンツを生成
    type ContentItem = {
      id: string
      type: 'archive' | 'seminar' | 'databook'
      title: string
      reason: string
      viewed: boolean
    }

    const content: ContentItem[] = recentArchives.map((archive, index) => ({
      id: archive.id,
      type: 'archive' as const,
      title: archive.title,
      reason: archive.recommendReason || archive.category.name || `おすすめ動画 #${index + 1}`,
      viewed: viewedArchiveIds.includes(archive.id)
    }))

    // データブックがあれば追加
    if (recentDatabook) {
      content.push({
        id: recentDatabook.id,
        type: 'databook',
        title: recentDatabook.title,
        reason: recentDatabook.description || '最新のデータブック',
        viewed: false // TODO: データブックの既読チェック
      })
    }

    return success(res, { content: content.slice(0, 3) })
  } catch (err) {
    console.error('Get recommended content error:', err)
    return internalError(res)
  }
}
