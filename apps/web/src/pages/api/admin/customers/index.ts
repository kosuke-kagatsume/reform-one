import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { search, status, plan, page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // フィルター条件を構築
    const where: any = {
      type: 'CUSTOMER'
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // 顧客一覧を取得
    const [customers, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
          users: {
            select: { userId: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.organization.count({ where })
    ])

    // 統計情報を取得
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      totalCustomers,
      lastMonthCustomers,
      activeSubscriptions,
      thisMonthRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      prisma.organization.count({ where: { type: 'CUSTOMER' } }),
      prisma.organization.count({
        where: { type: 'CUSTOMER', createdAt: { lt: thisMonthStart } }
      }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.invoice.aggregate({
        where: { status: 'PAID', paidAt: { gte: thisMonthStart } },
        _sum: { amount: true }
      }),
      prisma.invoice.aggregate({
        where: { status: 'PAID', paidAt: { gte: lastMonthStart, lt: thisMonthStart } },
        _sum: { amount: true }
      })
    ])

    const currentRevenue = thisMonthRevenue._sum.amount || 0
    const prevRevenue = lastMonthRevenue._sum.amount || 0
    const revenueChange = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : '0'

    const customerChange = lastMonthCustomers > 0
      ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1)
      : '0'

    // 顧客データを整形
    const formattedCustomers = customers.map(org => {
      const subscription = org.subscriptions[0]
      const userCount = org.users.length

      return {
        id: org.id,
        name: org.name,
        email: `admin@${org.slug}.co.jp`,
        phone: '-',
        plan: subscription?.planType || 'STARTER',
        status: subscription?.status?.toLowerCase() || 'inactive',
        users: userCount,
        revenue: subscription?.finalPrice || 0,
        joinedAt: org.createdAt.toISOString().split('T')[0],
        lastActive: formatTimeAgo(org.updatedAt),
        features: getFeaturesList(subscription?.planType)
      }
    })

    return res.status(200).json({
      customers: formattedCustomers,
      stats: {
        totalCustomers,
        customerChange: `${parseFloat(customerChange) >= 0 ? '+' : ''}${customerChange}%`,
        activeCustomers: activeSubscriptions,
        activeRate: ((activeSubscriptions / totalCustomers) * 100).toFixed(1),
        monthlyRevenue: currentRevenue,
        revenueChange: `${parseFloat(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
        avgRevenue: totalCustomers > 0 ? Math.round(currentRevenue / totalCustomers) : 0
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Get customers error:', error)
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

function getFeaturesList(planType?: string): string[] {
  switch (planType) {
    case 'EXPERT':
      return ['e-paper', 'training', 'online-salon', 'materials-catalog', 'analytics']
    case 'STANDARD':
      return ['e-paper', 'training', 'materials-catalog']
    default:
      return ['e-paper']
  }
}
