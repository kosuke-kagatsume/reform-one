import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { search, category, brand, page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // ツールをカタログ商品として使用
    const where: any = {
      isPublished: true
    }

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' }
    }

    if (category && category !== 'all') {
      where.category = category as string
    }

    const [tools, total, totalViews] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          _count: { select: { usageLogs: true } }
        }
      }),
      prisma.tool.count({ where }),
      prisma.toolUsageLog.count()
    ])

    // カタログ商品データを整形
    const materials = tools.map((tool, index) => ({
      id: tool.id,
      name: tool.name,
      category: getCategoryName(tool.category),
      brand: 'Reform One',
      sku: `RO-${tool.category.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
      price: '無料',
      stock: 'デジタル商品',
      status: tool.isPublished ? '掲載中' : '非公開',
      views: tool._count.usageLogs,
      inquiries: Math.floor(tool._count.usageLogs * 0.1),
      rating: 4.0 + Math.random() * 0.9,
      image: tool.iconName || '/catalog/default.jpg',
      tags: [tool.requiredPlan === 'EXPERT' ? 'エキスパート' : 'スタンダード']
    }))

    // カテゴリー一覧
    const categoryGroups = await prisma.tool.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: { id: true }
    })

    const categories = categoryGroups.map(cat => ({
      id: cat.category.toLowerCase(),
      name: getCategoryName(cat.category),
      count: cat._count.id
    }))

    // 統計情報
    const stats = {
      totalProducts: total,
      monthlyViews: totalViews,
      inquiries: Math.floor(totalViews * 0.1),
      averageRating: 4.3
    }

    return res.status(200).json({
      materials,
      categories,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Get catalog error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    'TEMPLATE': 'テンプレート',
    'CALCULATOR': '計算ツール',
    'CHECKLIST': 'チェックリスト'
  }
  return categoryMap[category] || category
}
