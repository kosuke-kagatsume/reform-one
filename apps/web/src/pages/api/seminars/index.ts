import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { sendSeminarNotification, shouldSendNotification } from '@/lib/event-notification'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { categoryId, upcoming } = req.query

    try {
      const where: any = {}

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (upcoming === 'true') {
        where.scheduledAt = { gte: new Date() }
      }

      const seminars = await prisma.seminar.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { scheduledAt: 'asc' }
      })

      return res.status(200).json({ seminars })
    } catch (error) {
      console.error('Get seminars error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { categoryId, title, description, instructor, imageUrl, zoomUrl, scheduledAt, duration, isPublic, publicPrice } = req.body

    if (!categoryId || !title || !scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const seminar = await prisma.seminar.create({
        data: {
          categoryId,
          title,
          description,
          instructor,
          imageUrl,
          zoomUrl,
          scheduledAt: new Date(scheduledAt),
          duration,
          isPublic: isPublic || false,
          publicPrice
        },
        include: { category: true }
      })

      // A-3: セミナー作成時に自動メール送信（公開設定の場合）
      // Note: isPublic is for external users; internal notifications always sent
      if (shouldSendNotification(true, null)) {
        // Send notification asynchronously (don't block the response)
        sendSeminarNotification({
          id: seminar.id,
          title: seminar.title,
          scheduledAt: seminar.scheduledAt,
          description: seminar.description,
          instructor: seminar.instructor,
          zoomUrl: seminar.zoomUrl,
          category: seminar.category,
        }).catch((err) => console.error('Failed to send seminar notification:', err))
      }

      return res.status(201).json({ seminar })
    } catch (error) {
      console.error('Create seminar error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
