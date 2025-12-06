import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { organizationId } = req.query

  if (!organizationId || typeof organizationId !== 'string') {
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
      return {
        userId: member.user.id,
        email: member.user.email,
        name: member.user.name,
        role: member.role,
        joinedAt: member.joinedAt,
        seminarCount: (activities['seminar_register'] || 0) + (activities['seminar_attend'] || 0),
        archiveCount: activities['archive_view'] || 0,
        communityCount: (activities['community_view'] || 0) + (activities['community_post'] || 0),
        lastActivityAt: lastActivityMap.get(member.userId) || null
      }
    })

    return res.status(200).json({ members: response })
  } catch (error) {
    console.error('Get members error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
