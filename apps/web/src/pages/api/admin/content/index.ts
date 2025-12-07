import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { status, category, search, page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Archive (コンテンツ) を取得
    const where: any = {}

    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' }
    }

    const [archives, total, totalViews, publishedCount] = await Promise.all([
      prisma.archive.findMany({
        where,
        include: {
          category: true,
          _count: { select: { views: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.archive.count({ where }),
      prisma.archiveView.count(),
      prisma.archive.count({ where: { ...where } })
    ])

    // Newsletter を取得
    const newsletters = await prisma.newsletter.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    // 記事データを整形
    const articles = archives.map((archive, index) => ({
      id: archive.id,
      title: archive.title,
      category: archive.category?.name || 'その他',
      author: '編集部',
      department: '編集部',
      status: 'published',
      views: archive._count.views,
      publishedAt: archive.publishedAt?.toISOString().split('T')[0] || null,
      updatedAt: formatTimeAgo(archive.updatedAt),
      type: 'article'
    }))

    // 統計情報
    const stats = [
      {
        title: '総コンテンツ数',
        value: total.toString(),
        change: '+' + Math.round(total * 0.04),
        changeLabel: '今月',
        color: 'blue'
      },
      {
        title: '公開中',
        value: publishedCount.toString(),
        change: '+' + Math.round(publishedCount * 0.02),
        changeLabel: '今週',
        color: 'green'
      },
      {
        title: 'レビュー待ち',
        value: newsletters.filter(n => !n.isPublished).length.toString(),
        change: newsletters.filter(n => !n.isPublished).length.toString(),
        changeLabel: '件',
        color: 'yellow'
      },
      {
        title: '総閲覧数',
        value: totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : totalViews.toLocaleString(),
        change: '+15%',
        changeLabel: '前月比',
        color: 'purple'
      }
    ]

    return res.status(200).json({
      articles,
      videos: [],
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Get content error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`
  return `${Math.floor(days / 7)}週間前`
}
