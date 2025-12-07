import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 今月の初日と前月の初日を計算
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      // 顧客数（今月と先月）
      totalCustomers,
      lastMonthCustomers,
      // アクティブ契約数
      activeSubscriptions,
      lastMonthActiveSubscriptions,
      // 今月の売上（Invoice合計）
      thisMonthRevenue,
      lastMonthRevenue,
      // 新規リード（今月新規登録）
      newLeadsThisMonth,
      lastMonthLeads
    ] = await Promise.all([
      prisma.organization.count({
        where: { type: 'CUSTOMER' }
      }),
      prisma.organization.count({
        where: {
          type: 'CUSTOMER',
          createdAt: { lt: thisMonthStart }
        }
      }),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          createdAt: { lt: thisMonthStart }
        }
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: thisMonthStart }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: lastMonthStart, lt: thisMonthStart }
        },
        _sum: { amount: true }
      }),
      prisma.organization.count({
        where: {
          type: 'CUSTOMER',
          createdAt: { gte: thisMonthStart }
        }
      }),
      prisma.organization.count({
        where: {
          type: 'CUSTOMER',
          createdAt: { gte: lastMonthStart, lt: thisMonthStart }
        }
      })
    ])

    // 変化率計算
    const calculateChange = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? '+100%' : '0%'
      const change = ((current - previous) / previous) * 100
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    }

    const currentRevenue = thisMonthRevenue._sum.amount || 0
    const previousRevenue = lastMonthRevenue._sum.amount || 0

    const stats = [
      {
        title: '総顧客数',
        value: totalCustomers.toLocaleString(),
        change: calculateChange(totalCustomers, lastMonthCustomers),
        trend: totalCustomers >= lastMonthCustomers ? 'up' : 'down',
        color: 'blue'
      },
      {
        title: '月間売上',
        value: `¥${(currentRevenue / 1000000).toFixed(1)}M`,
        change: calculateChange(currentRevenue, previousRevenue),
        trend: currentRevenue >= previousRevenue ? 'up' : 'down',
        color: 'green'
      },
      {
        title: 'アクティブ契約',
        value: activeSubscriptions.toLocaleString(),
        change: calculateChange(activeSubscriptions, lastMonthActiveSubscriptions),
        trend: activeSubscriptions >= lastMonthActiveSubscriptions ? 'up' : 'down',
        color: 'purple'
      },
      {
        title: '新規リード',
        value: newLeadsThisMonth.toString(),
        change: calculateChange(newLeadsThisMonth, lastMonthLeads),
        trend: newLeadsThisMonth >= lastMonthLeads ? 'up' : 'down',
        color: 'orange'
      }
    ]

    return res.status(200).json({ stats })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
