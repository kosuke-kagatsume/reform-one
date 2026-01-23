import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (req.method === 'GET') {
      const siteVisits = await prisma.siteVisit.findMany({
        include: {
          _count: {
            select: { participants: true },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      })

      const result = siteVisits.map((v) => ({
        ...v,
        participantCount: v._count.participants,
      }))

      return res.status(200).json(result)
    }

    if (req.method === 'POST') {
      const {
        title,
        companyName,
        description,
        location,
        address,
        imageUrl,
        scheduledAt,
        duration,
        capacity,
        price,
        hasAfterParty,
        afterPartyPrice,
        isPublished,
      } = req.body

      if (!title || !location || !scheduledAt || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const siteVisit = await prisma.siteVisit.create({
        data: {
          title,
          companyName: companyName || null,
          description,
          location,
          address,
          imageUrl,
          scheduledAt: new Date(scheduledAt),
          duration: duration ? parseInt(duration, 10) : null,
          capacity: capacity ? parseInt(capacity, 10) : 20,
          price: parseFloat(price),
          hasAfterParty: hasAfterParty ?? false,
          afterPartyPrice: afterPartyPrice ? parseFloat(afterPartyPrice) : null,
          isPublished: isPublished ?? false,
        },
      })

      return res.status(201).json(siteVisit)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin site visits error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
