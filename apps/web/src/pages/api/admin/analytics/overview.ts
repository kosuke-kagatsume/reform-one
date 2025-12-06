import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import {
  success,
  error,
  methodNotAllowed,
  unauthorized,
  forbidden,
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
      return unauthorized(res)
    }

    // 管理者のみ
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    })

    if (!user || user.userType !== 'EMPLOYEE') {
      return forbidden(res, '管理者権限が必要です')
    }

    // 期間パラメータ
    const { period = '30d' } = req.query
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    // 各種統計を並行取得
    const [
      totalOrganizations,
      activeSubscriptions,
      totalUsers,
      newUsersInPeriod,
      seminarParticipants,
      archiveViews,
      databookDownloads,
      siteVisitParticipants,
      recentActivities,
      subscriptionsByPlan,
      monthlyRevenue,
    ] = await Promise.all([
      // 総組織数
      prisma.organization.count(),

      // アクティブサブスクリプション
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),

      // 総ユーザー数
      prisma.user.count(),

      // 期間内の新規ユーザー
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // セミナー参加者数
      prisma.seminarParticipant.count({
        where: {
          registeredAt: { gte: startDate },
        },
      }),

      // アーカイブ視聴数
      prisma.archiveView.count({
        where: {
          viewedAt: { gte: startDate },
        },
      }),

      // データブックダウンロード数
      prisma.databookDownload.count({
        where: {
          downloadedAt: { gte: startDate },
        },
      }),

      // 視察会参加者数
      prisma.siteVisitParticipant.count({
        where: {
          registeredAt: { gte: startDate },
          status: { in: ['CONFIRMED', 'ATTENDED'] },
        },
      }),

      // 最近のアクティビティ
      prisma.activityLog.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // プラン別サブスクリプション数
      prisma.subscription.groupBy({
        by: ['planType'],
        where: { status: 'ACTIVE' },
        _count: true,
      }),

      // 月間収益（請求書から）
      prisma.invoice.aggregate({
        where: {
          status: 'paid',
          paidAt: { gte: startDate },
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    // 日別統計を計算
    const dailyStats = await getDailyStats(startDate)

    return success(res, {
      summary: {
        totalOrganizations,
        activeSubscriptions,
        totalUsers,
        newUsersInPeriod,
      },
      engagement: {
        seminarParticipants,
        archiveViews,
        databookDownloads,
        siteVisitParticipants,
      },
      subscriptionsByPlan: subscriptionsByPlan.reduce((acc, item) => {
        acc[item.planType] = item._count
        return acc
      }, {} as Record<string, number>),
      revenue: {
        total: monthlyRevenue._sum.amount || 0,
      },
      dailyStats,
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        type: a.activityType,
        resourceType: a.resourceType,
        createdAt: a.createdAt,
      })),
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return internalError(res)
  }
}

async function getDailyStats(startDate: Date) {
  // データベースレベルで日付ごとにグループ化して集計
  // これにより大量のデータがあってもメモリ問題を回避
  const dailyActivities = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
    SELECT
      DATE("createdAt") as date,
      COUNT(*) as count
    FROM "ActivityLog"
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE("createdAt")
    ORDER BY date
  `

  // BigIntをnumberに変換してMapに格納
  const dailyMap = new Map<string, number>()
  dailyActivities.forEach((a) => {
    const dateKey = new Date(a.date).toISOString().split('T')[0]
    dailyMap.set(dateKey, Number(a.count))
  })

  // 日付の配列を作成（期間内の全日付を含む）
  const days: { date: string; activities: number }[] = []
  const currentDate = new Date(startDate)
  const endDate = new Date()

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    days.push({
      date: dateKey,
      activities: dailyMap.get(dateKey) || 0,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
}
