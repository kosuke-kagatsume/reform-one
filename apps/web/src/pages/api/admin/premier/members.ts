import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get users who belong to CUSTOMER organizations
    const userOrgs = await prisma.userOrganization.findMany({
      where: {
        organization: { type: 'CUSTOMER' }
      },
      include: {
        user: true,
        organization: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              take: 1
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

    const members = userOrgs.map(uo => ({
      id: uo.user.id,
      name: uo.user.name,
      email: uo.user.email,
      role: uo.role,
      status: 'ACTIVE',
      createdAt: uo.joinedAt.toISOString(),
      organization: {
        id: uo.organization.id,
        name: uo.organization.name,
        subscription: uo.organization.subscriptions[0] ? {
          planType: uo.organization.subscriptions[0].planType,
          status: uo.organization.subscriptions[0].status
        } : null
      },
      _count: {
        activities: activityMap.get(uo.userId) || 0
      }
    }))

    return res.status(200).json({ members })
  } catch (error) {
    console.error('Get members error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
