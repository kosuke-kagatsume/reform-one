import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAuth(req)
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Get organizationId from query or from authenticated user
  let organizationId = req.query.organizationId as string
  if (!organizationId) {
    organizationId = auth.orgId || ''
  }

  if (!organizationId) {
    return res.status(400).json({ error: 'Organization ID is required' })
  }

  try {
    const members = await prisma.userOrganization.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    const activityLogs = await prisma.activityLog.groupBy({
      by: ['userId', 'activityType'],
      where: {
        orgId: organizationId
      },
      _count: true
    })

    const activityMap = new Map<string, Record<string, number>>()
    activityLogs.forEach(log => {
      if (!activityMap.has(log.userId)) {
        activityMap.set(log.userId, {})
      }
      activityMap.get(log.userId)![log.activityType] = log._count
    })

    const lastActivities = await prisma.activityLog.findMany({
      where: {
        orgId: organizationId,
        userId: { in: members.map(m => m.userId) }
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
      select: {
        userId: true,
        createdAt: true
      }
    })

    const lastActivityMap = new Map<string, Date>()
    lastActivities.forEach(activity => {
      lastActivityMap.set(activity.userId, activity.createdAt)
    })

    const response = members.map(member => {
      const activities = activityMap.get(member.userId) || {}
      const totalActivities =
        (activities['seminar_register'] || 0) +
        (activities['seminar_attend'] || 0) +
        (activities['archive_view'] || 0) +
        (activities['community_view'] || 0) +
        (activities['community_post'] || 0)

      return {
        id: member.user.id,
        email: member.user.email,
        name: member.user.name,
        role: member.role,
        status: 'ACTIVE',
        createdAt: member.joinedAt.toISOString(),
        _count: {
          activities: totalActivities
        }
      }
    })

    return res.status(200).json({ members: response, invitations: [] })
  } catch (error) {
    console.error('Get members error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
