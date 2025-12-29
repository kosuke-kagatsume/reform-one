import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      // 基本統計
      totalOrganizations,
      activeSubscriptions,
      canceledSubscriptions,
      upcomingSeminars,
      totalArchives,
      communityCategories,
      totalMembers,
      totalTools,
      // 更新期限別
      expiring30Days,
      expiring60Days,
      // セミナー詳細
      nextSeminar,
      totalParticipants,
      lastMonthParticipants,
      // アーカイブ詳細（非公開は現在スキーマにないので0）
      // コミュニティ詳細
      activeCommunities,
      inactiveCommunities,
      // 会員詳細
      activeMembers,
      inactiveMembers,
      // プラン別
      standardSubscriptions,
      expertSubscriptions,
      // 今月の新規・解約
      newSubscriptionsThisMonth,
      canceledThisMonth
    ] = await Promise.all([
      // 基本統計
      prisma.organization.count({
        where: { type: 'CUSTOMER' }
      }),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.subscription.count({
        where: { status: 'CANCELED' }
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
      prisma.tool.count(),
      // 更新期限30日以内
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: now,
            lte: thirtyDaysFromNow
          }
        }
      }),
      // 更新期限60日以内（30日超）
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gt: thirtyDaysFromNow,
            lte: sixtyDaysFromNow
          }
        }
      }),
      // 次回セミナー
      prisma.seminar.findFirst({
        where: { scheduledAt: { gte: now } },
        orderBy: { scheduledAt: 'asc' },
        select: { id: true, title: true, scheduledAt: true }
      }),
      // 累計参加者数
      prisma.seminarParticipant.count(),
      // 先月の参加者数
      prisma.seminarParticipant.count({
        where: {
          registeredAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: startOfMonth
          }
        }
      }),
      // アクティブコミュニティ（30日以内に投稿あり）
      prisma.communityCategory.count({
        where: {
          posts: {
            some: {
              createdAt: { gte: thirtyDaysAgo }
            }
          }
        }
      }),
      // 非アクティブコミュニティ（30日以上投稿なし）
      prisma.communityCategory.count({
        where: {
          posts: {
            none: {
              createdAt: { gte: thirtyDaysAgo }
            }
          }
        }
      }),
      // 直近30日ログイン会員
      prisma.user.count({
        where: {
          lastLoginAt: { gte: thirtyDaysAgo },
          organizations: {
            some: {
              organization: { type: 'CUSTOMER' }
            }
          }
        }
      }),
      // 30日以上未ログイン会員
      prisma.user.count({
        where: {
          OR: [
            { lastLoginAt: { lt: thirtyDaysAgo } },
            { lastLoginAt: null }
          ],
          organizations: {
            some: {
              organization: { type: 'CUSTOMER' }
            }
          }
        }
      }),
      // STANDARDプラン
      prisma.subscription.count({
        where: { status: 'ACTIVE', planType: 'STANDARD' }
      }),
      // EXPERTプラン
      prisma.subscription.count({
        where: { status: 'ACTIVE', planType: 'EXPERT' }
      }),
      // 今月新規契約
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: startOfMonth }
        }
      }),
      // 今月解約
      prisma.subscription.count({
        where: {
          status: 'CANCELED',
          canceledAt: { gte: startOfMonth }
        }
      })
    ])

    // 今月の参加者数
    const thisMonthParticipants = await prisma.seminarParticipant.count({
      where: {
        registeredAt: { gte: startOfMonth }
      }
    })

    // 参加者数の前月比
    const participantsDiff = thisMonthParticipants - lastMonthParticipants

    // 最終更新時刻
    const lastUpdatedAt = now.toISOString()

    return res.status(200).json({
      // 基本統計
      totalOrganizations,
      activeSubscriptions,
      canceledSubscriptions,
      upcomingSeminars,
      totalArchives,
      communityCategories,
      totalMembers,
      totalTools,
      // 詳細統計
      details: {
        // 契約組織の内訳
        organizations: {
          total: totalOrganizations,
          active: activeSubscriptions,
          canceled: canceledSubscriptions
        },
        // 更新期限別
        expiringSubscriptions: {
          within30Days: expiring30Days,
          within60Days: expiring60Days
        },
        // セミナー
        seminars: {
          upcoming: upcomingSeminars,
          nextSeminar: nextSeminar,
          totalParticipants,
          participantsDiff
        },
        // アーカイブ（将来的に非公開・下書きを追加）
        archives: {
          total: totalArchives,
          unpublished: 0,
          draft: 0
        },
        // コミュニティ
        communities: {
          total: communityCategories,
          active: activeCommunities,
          inactive: inactiveCommunities
        },
        // 会員
        members: {
          total: totalMembers,
          active: activeMembers,
          inactive: inactiveMembers
        },
        // プラン別
        plans: {
          standard: {
            active: standardSubscriptions,
            newThisMonth: 0, // 詳細が必要な場合は別クエリ
            canceledThisMonth: 0
          },
          expert: {
            active: expertSubscriptions,
            newThisMonth: 0,
            canceledThisMonth: 0
          },
          newThisMonth: newSubscriptionsThisMonth,
          canceledThisMonth: canceledThisMonth
        }
      },
      // 運営アラート
      alerts: {
        expiringSubscriptions: expiring30Days,
        unpublishedUpcomingSeminars: 0, // 将来的に実装
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
