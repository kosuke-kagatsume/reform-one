import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const events: Array<{
      id: string
      title: string
      type: 'seminar' | 'site_visit' | 'offline_meeting'
      scheduledAt: Date
      participantCount: number
    }> = []

    // Get seminars with participants
    const seminars = await prisma.seminar.findMany({
      include: {
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: 'desc' },
      take: 20
    })

    seminars.forEach(s => {
      events.push({
        id: `seminar_${s.id}`,
        title: s.title,
        type: 'seminar',
        scheduledAt: s.scheduledAt,
        participantCount: s._count.participants
      })
    })

    // Get site visits with participants
    const siteVisits = await prisma.siteVisit.findMany({
      where: {
        isPublished: true
      },
      include: {
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: 'desc' },
      take: 20
    })

    siteVisits.forEach(sv => {
      events.push({
        id: `site_visit_${sv.id}`,
        title: sv.title,
        type: 'site_visit',
        scheduledAt: sv.scheduledAt,
        participantCount: sv._count.participants
      })
    })

    // Sort by date descending
    events.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

    return res.status(200).json({ events })
  } catch (error) {
    console.error('Get selectable events error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
