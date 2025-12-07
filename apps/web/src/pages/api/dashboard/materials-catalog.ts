import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { search, category, page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // ツールを建材カタログとして使用
    const where: any = {
      isPublished: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'all') {
      where.category = category as string
    }

    const [tools, total, categoryGroups] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limitNum,
        include: {
          _count: { select: { usageLogs: true } }
        }
      }),
      prisma.tool.count({ where }),
      prisma.tool.groupBy({
        by: ['category'],
        where: { isPublished: true },
        _count: { id: true }
      })
    ])

    // 建材データを整形
    const materials = tools.map((tool, index) => ({
      id: tool.id,
      name: tool.name,
      manufacturer: 'Reform One',
      category: getCategoryName(tool.category),
      description: tool.description || '',
      price: tool.requiredPlan === 'EXPERT' ? 'エキスパートプラン限定' : '無料',
      features: [
        tool.requiredPlan === 'EXPERT' ? 'エキスパート' : 'スタンダード',
        tool.category,
        'デジタルツール'
      ],
      rating: 4.0 + Math.random() * 0.9,
      reviews: tool._count.usageLogs,
      isNew: index < 2,
      isFavorite: false,
      certification: [tool.requiredPlan === 'EXPERT' ? 'エキスパート限定' : '全プラン対応'],
      image: tool.iconName || '/api/placeholder/300/300'
    }))

    // カテゴリー一覧
    const categories = [
      { id: 'all', name: 'すべて', count: total },
      ...categoryGroups.map(cat => ({
        id: cat.category.toLowerCase(),
        name: getCategoryName(cat.category),
        count: cat._count.id
      }))
    ]

    // メーカー一覧
    const manufacturers = ['Reform One', 'パートナー企業']

    return res.status(200).json({
      materials,
      categories,
      manufacturers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Get materials catalog error:', error)
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
