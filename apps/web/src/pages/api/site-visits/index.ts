import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get site visits list
    try {
      const auth = await verifyAuth(req)
      if (!auth) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { upcoming, past } = req.query

      const now = new Date()
      let dateFilter = {}

      if (upcoming === 'true') {
        dateFilter = { scheduledAt: { gte: now } }
      } else if (past === 'true') {
        dateFilter = { scheduledAt: { lt: now } }
      }

      const siteVisits = await prisma.siteVisit.findMany({
        where: {
          isPublished: true,
          isCanceled: false,
          ...dateFilter,
        },
        include: {
          _count: {
            select: { participants: true },
          },
          participants: {
            where: { userId: auth.userId },
            select: {
              id: true,
              status: true,
              paymentStatus: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      })

      // Transform to include participation status
      const result = siteVisits.map((visit) => ({
        id: visit.id,
        title: visit.title,
        description: visit.description,
        location: visit.location,
        address: visit.address,
        imageUrl: visit.imageUrl,
        scheduledAt: visit.scheduledAt,
        duration: visit.duration,
        capacity: visit.capacity,
        price: visit.price,
        participantCount: visit._count.participants,
        isRegistered: visit.participants.length > 0,
        registrationStatus: visit.participants[0]?.status || null,
        paymentStatus: visit.participants[0]?.paymentStatus || null,
        isFull: visit._count.participants >= visit.capacity,
      }))

      return res.status(200).json(result)
    } catch (error) {
      console.error('Get site visits error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Admin only: Create new site visit
    try {
      const auth = await verifyAuth(req)
      if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const {
        title,
        description,
        location,
        address,
        imageUrl,
        scheduledAt,
        duration,
        capacity,
        price,
        isPublished,
      } = req.body

      if (!title || !location || !scheduledAt || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const siteVisit = await prisma.siteVisit.create({
        data: {
          title,
          description,
          location,
          address,
          imageUrl,
          scheduledAt: new Date(scheduledAt),
          duration: duration ? parseInt(duration, 10) : null,
          capacity: capacity ? parseInt(capacity, 10) : 20,
          price: parseFloat(price),
          isPublished: isPublished ?? false,
        },
      })

      return res.status(201).json(siteVisit)
    } catch (error) {
      console.error('Create site visit error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
