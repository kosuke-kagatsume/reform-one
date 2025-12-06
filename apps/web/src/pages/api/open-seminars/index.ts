import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Open seminars - no authentication required for viewing
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const now = new Date()

      // Get public seminars
      const seminars = await prisma.seminar.findMany({
        where: {
          isPublic: true,
          scheduledAt: { gte: now },
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { participants: true },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      })

      // Get registration counts from OpenSeminarRegistration
      const registrations = await prisma.openSeminarRegistration.groupBy({
        by: ['seminarId'],
        _count: { id: true },
      })

      const regMap = new Map(registrations.map((r) => [r.seminarId, r._count.id]))

      const result = seminars.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        instructor: s.instructor,
        imageUrl: s.imageUrl,
        scheduledAt: s.scheduledAt,
        duration: s.duration,
        price: s.publicPrice,
        category: s.category,
        registrationCount: (regMap.get(s.id) || 0) + s._count.participants,
      }))

      return res.status(200).json(result)
    } catch (error) {
      console.error('Get open seminars error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
