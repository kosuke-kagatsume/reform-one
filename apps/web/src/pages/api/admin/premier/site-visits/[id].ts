import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    if (req.method === 'GET') {
      const siteVisit = await prisma.siteVisit.findUnique({
        where: { id },
        include: {
          _count: {
            select: { participants: true },
          },
        },
      })

      if (!siteVisit) {
        return res.status(404).json({ error: 'Site visit not found' })
      }

      return res.status(200).json({
        ...siteVisit,
        participantCount: siteVisit._count.participants,
      })
    }

    if (req.method === 'PUT') {
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
        isCanceled,
      } = req.body

      if (!title || !location || !scheduledAt || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const siteVisit = await prisma.siteVisit.update({
        where: { id },
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
          isCanceled: isCanceled ?? false,
        },
      })

      return res.status(200).json(siteVisit)
    }

    if (req.method === 'DELETE') {
      await prisma.siteVisit.delete({
        where: { id },
      })

      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin site visit error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
