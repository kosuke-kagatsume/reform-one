import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [
      totalOrganizations,
      activeSubscriptions,
      upcomingSeminars,
      totalArchives,
      communityCategories,
      totalMembers,
      // 運営アラート用データ
      expiringSubscriptions,
      unpublishedUpcomingSeminars,
      totalTools
    ] = await Promise.all([
      // 基本統計
      prisma.organization.count({
        where: { type: 'CUSTOMER' }
      }),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.seminar.count({
        where: {
          scheduledAt: { gte: now }
        }
      }),
      prisma.archive.count(),
      prisma.communityCategory.count(),
      prisma.userOrganization.count({
        where: {
          organization: { type: 'CUSTOMER' }
        }
      }),
      // 契約期限が近い組織（30日以内）
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: now,
            lte: thirtyDaysFromNow
          }
        }
      }),
      // 開催7日以内のセミナー
      prisma.seminar.count({
        where: {
          scheduledAt: {
            gte: now,
            lte: sevenDaysFromNow
          }
        }
      }),
      // ツール総数
      prisma.tool.count()
    ])

    // 最終更新時刻
    const lastUpdatedAt = now.toISOString()

    return res.status(200).json({
      // 基本統計
      totalOrganizations,
      activeSubscriptions,
      upcomingSeminars,
      totalArchives,
      communityCategories,
      totalMembers,
      totalTools,
      // 運営アラート
      alerts: {
        expiringSubscriptions,
        unpublishedUpcomingSeminars,
        // 将来的に追加: 未入金、問い合わせなど
        unpaidInvoices: 0,
        pendingInquiries: 0
      },
      // メタ情報
      lastUpdatedAt
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
