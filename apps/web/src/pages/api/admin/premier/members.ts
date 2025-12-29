import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get users who belong to CUSTOMER organizations
    const userOrgs = await prisma.userOrganization.findMany({
      where: {
        organization: { type: 'CUSTOMER' }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            lastLoginAt: true,
            status: true,
            createdAt: true
          }
        },
        organization: {
          include: {
            subscriptions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                planType: true,
                status: true,
                currentPeriodEnd: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    // Get activity counts for each user
    const userIds = userOrgs.map(uo => uo.userId)
    const activityCounts = await prisma.activityLog.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: { id: true }
    })
    const activityMap = new Map(activityCounts.map(ac => [ac.userId, ac._count.id]))

    const members = userOrgs.map(uo => {
      const lastLoginAt = uo.user.lastLoginAt
      let loginStatus: 'recent' | 'normal' | 'inactive' | 'never' = 'never'
      let daysSinceLogin: number | null = null

      if (lastLoginAt) {
        daysSinceLogin = Math.floor((now.getTime() - new Date(lastLoginAt).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceLogin <= 7) {
          loginStatus = 'recent'
        } else if (daysSinceLogin <= 30) {
          loginStatus = 'normal'
        } else {
          loginStatus = 'inactive'
        }
      }

      return {
        id: uo.user.id,
        name: uo.user.name,
        email: uo.user.email,
        role: uo.role,
        status: uo.user.status || 'ACTIVE',
        createdAt: uo.joinedAt.toISOString(),
        lastLoginAt: lastLoginAt?.toISOString() || null,
        loginStatus,
        daysSinceLogin,
        organization: {
          id: uo.organization.id,
          name: uo.organization.name,
          subscription: uo.organization.subscriptions[0] ? {
            planType: uo.organization.subscriptions[0].planType,
            status: uo.organization.subscriptions[0].status,
            currentPeriodEnd: uo.organization.subscriptions[0].currentPeriodEnd
          } : null
        },
        _count: {
          activities: activityMap.get(uo.userId) || 0
        }
      }
    })

    // Calculate stats
    const stats = {
      total: members.length,
      active: members.filter(m => m.status === 'ACTIVE').length,
      inactive: members.filter(m => m.status !== 'ACTIVE').length,
      recentLogin: members.filter(m => m.loginStatus === 'recent' || m.loginStatus === 'normal').length,
      notLoggedIn30Days: members.filter(m => m.loginStatus === 'inactive' || m.loginStatus === 'never').length,
      neverLoggedIn: members.filter(m => m.loginStatus === 'never').length,
      byPlan: {
        expert: members.filter(m => m.organization.subscription?.planType === 'EXPERT').length,
        standard: members.filter(m => m.organization.subscription?.planType === 'STANDARD').length,
        noSubscription: members.filter(m => !m.organization.subscription).length
      }
    }

    // Get unique organizations for filter dropdown
    const uniqueOrgs = Array.from(
      new Map(members.map(m => [m.organization.id, { id: m.organization.id, name: m.organization.name }])).values()
    )

    return res.status(200).json({
      members,
      stats,
      organizations: uniqueOrgs
    })
  } catch (error) {
    console.error('Get members error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
