import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'GET') {
    try {
      const auth = await verifyAuth(req)
      if (!auth) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const siteVisit = await prisma.siteVisit.findUnique({
        where: { id },
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
              registeredAt: true,
              paidAt: true,
            },
          },
        },
      })

      if (!siteVisit) {
        return res.status(404).json({ error: 'Site visit not found' })
      }

      return res.status(200).json({
        ...siteVisit,
        participantCount: siteVisit._count.participants,
        isRegistered: siteVisit.participants.length > 0,
        registration: siteVisit.participants[0] || null,
        isFull: siteVisit._count.participants >= siteVisit.capacity,
      })
    } catch (error) {
      console.error('Get site visit error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    // Admin only: Update site visit
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
        isCanceled,
      } = req.body

      const siteVisit = await prisma.siteVisit.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(location && { location }),
          ...(address !== undefined && { address }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
          ...(duration !== undefined && { duration: duration ? parseInt(duration, 10) : null }),
          ...(capacity !== undefined && { capacity: parseInt(capacity, 10) }),
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(isPublished !== undefined && { isPublished }),
          ...(isCanceled !== undefined && { isCanceled }),
        },
      })

      return res.status(200).json(siteVisit)
    } catch (error) {
      console.error('Update site visit error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    // Admin only: Delete site visit
    try {
      const auth = await verifyAuth(req)
      if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      await prisma.siteVisit.delete({
        where: { id },
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete site visit error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
