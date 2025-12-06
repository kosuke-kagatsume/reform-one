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
      const recommendations = await prisma.recommendation.findMany({
        include: {
          _count: {
            select: { dismissals: true },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      })

      const result = recommendations.map((r) => ({
        ...r,
        dismissalCount: r._count.dismissals,
      }))

      return res.status(200).json(result)
    }

    if (req.method === 'POST') {
      const {
        title,
        description,
        imageUrl,
        linkUrl,
        linkText,
        targetType,
        position,
        priority,
        startAt,
        endAt,
        isActive,
      } = req.body

      if (!title || !linkUrl || !targetType) {
        return res.status(400).json({ error: 'Title, linkUrl, and targetType are required' })
      }

      const recommendation = await prisma.recommendation.create({
        data: {
          title,
          description,
          imageUrl,
          linkUrl,
          linkText: linkText || '詳細を見る',
          targetType,
          position: position || 'POPUP',
          priority: priority ?? 0,
          startAt: startAt ? new Date(startAt) : null,
          endAt: endAt ? new Date(endAt) : null,
          isActive: isActive ?? true,
        },
      })

      return res.status(201).json(recommendation)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin recommendations error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
