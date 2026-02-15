import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { sendSiteVisitNotification, shouldSendNotification } from '@/lib/event-notification'

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
        maxPerOrganization,
        priceStandard,
        priceExpert,
        expertFreeQuota,
        hasAfterParty,
        afterPartyPrice,
        afterPartyCapacity,
        afterPartyLocation,
        isPublished,
      } = req.body

      if (!title || !location || !scheduledAt || priceStandard === undefined) {
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
          maxPerOrganization: maxPerOrganization ? parseInt(maxPerOrganization, 10) : 2,
          priceStandard: parseFloat(priceStandard),
          priceExpert: priceExpert !== undefined ? parseFloat(priceExpert) : 0,
          expertFreeQuota: expertFreeQuota ? parseInt(expertFreeQuota, 10) : 2,
          hasAfterParty: hasAfterParty ?? false,
          afterPartyPrice: afterPartyPrice ? parseFloat(afterPartyPrice) : null,
          afterPartyCapacity: afterPartyCapacity ? parseInt(afterPartyCapacity, 10) : null,
          afterPartyLocation: afterPartyLocation || null,
          isPublished: isPublished ?? false,
        },
      })

      // A-3: 視察会作成時に自動メール送信（公開設定の場合）
      if (shouldSendNotification(siteVisit.isPublished, null)) {
        sendSiteVisitNotification({
          id: siteVisit.id,
          title: siteVisit.title,
          scheduledAt: siteVisit.scheduledAt,
          description: siteVisit.description,
          companyName: siteVisit.companyName,
          location: siteVisit.location,
          capacity: siteVisit.capacity,
        }).catch((err) => console.error('Failed to send site visit notification:', err))
      }

      return res.status(201).json(siteVisit)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin site visits error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
