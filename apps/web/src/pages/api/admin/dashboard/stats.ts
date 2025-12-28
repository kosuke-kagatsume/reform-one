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

    // 30日後の日付（契約期限アラート用）
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    // 7日後の日付（セミナー開催アラート用）
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

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
      lastMonthLeads,
      // セミナー関連
      upcomingSeminars,
      archiveVideos,
      // コミュニティ
      communityCount,
      // 総会員数
      totalMembers,
      // 運営アラート用データ
      expiringContracts,
      unpublishedUpcomingSeminars,
      pendingInvoices
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
      }),
      // 今後のセミナー（開催予定）
      prisma.seminar.count({
        where: {
          scheduledAt: { gte: now }
        }
      }),
      // 公開中アーカイブ
      prisma.archive.count(),
      // コミュニティカテゴリ数
      prisma.communityCategory.count(),
      // 総会員数（全組織）
      prisma.userOrganization.count({
        where: {
          role: { in: ['MEMBER', 'ADMIN'] },
          organization: { type: 'CUSTOMER' }
        }
      }),
      // 契約期限が30日以内の組織
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: now,
            lte: thirtyDaysFromNow
          }
        }
      }),
      // 7日以内開催のセミナー（アラート用）
      prisma.seminar.count({
        where: {
          scheduledAt: {
            gte: now,
            lte: sevenDaysFromNow
          }
        }
      }),
      // 未入金/請求未発行
      prisma.invoice.count({
        where: {
          status: { in: ['PENDING', 'SENT'] }
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

    // 最終更新時刻
    const lastUpdated = now.toISOString()

    const stats = [
      {
        title: '契約組織数',
        subtitle: '全期間',
        value: totalCustomers.toLocaleString(),
        change: calculateChange(totalCustomers, lastMonthCustomers),
        trend: totalCustomers >= lastMonthCustomers ? 'up' : 'down',
        color: 'blue',
        href: '/admin/premier/organizations'
      },
      {
        title: '有効契約数',
        subtitle: '期限内',
        value: activeSubscriptions.toLocaleString(),
        change: calculateChange(activeSubscriptions, lastMonthActiveSubscriptions),
        trend: activeSubscriptions >= lastMonthActiveSubscriptions ? 'up' : 'down',
        color: 'purple',
        href: '/admin/premier/organizations?status=active'
      },
      {
        title: '開催予定セミナー',
        subtitle: '公開中',
        value: upcomingSeminars.toString(),
        change: '',
        trend: 'up' as const,
        color: 'green',
        href: '/admin/premier/seminars'
      },
      {
        title: '公開中アーカイブ',
        subtitle: '本数',
        value: archiveVideos.toString(),
        change: '',
        trend: 'up' as const,
        color: 'orange',
        href: '/admin/premier/archives'
      },
      {
        title: 'コミュニティ数',
        subtitle: 'アクティブ',
        value: communityCount.toString(),
        change: '',
        trend: 'up' as const,
        color: 'pink',
        href: '/admin/premier/communities'
      },
      {
        title: '登録会員数',
        subtitle: '全組織',
        value: totalMembers.toLocaleString(),
        change: '',
        trend: 'up' as const,
        color: 'cyan',
        href: '/admin/premier/members'
      }
    ]

    // 運営アラート
    const alerts = [
      {
        id: 'expiring-contracts',
        type: 'warning',
        title: '契約期限が近い組織',
        description: '30日以内に期限を迎える契約',
        count: expiringContracts,
        href: '/admin/premier/organizations?filter=expiring'
      },
      {
        id: 'upcoming-seminars',
        type: 'info',
        title: '直近のセミナー',
        description: '7日以内に開催予定',
        count: unpublishedUpcomingSeminars,
        href: '/admin/premier/seminars'
      },
      {
        id: 'pending-invoices',
        type: 'info',
        title: '未入金/請求未発行',
        description: '対応が必要な請求',
        count: pendingInvoices,
        href: '/admin/premier/invoices?filter=pending'
      }
    ].filter(alert => alert.count > 0)

    return res.status(200).json({
      stats,
      alerts,
      lastUpdated,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
