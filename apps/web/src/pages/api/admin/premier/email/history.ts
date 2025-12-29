import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { recipientId, recipientType, limit = '50', offset = '0' } = req.query

  try {
    const where: Record<string, unknown> = {}

    if (recipientId && typeof recipientId === 'string') {
      where.recipientId = recipientId
    }

    if (recipientType && typeof recipientType === 'string') {
      where.recipientType = recipientType
    }

    const [history, total] = await Promise.all([
      prisma.emailHistory.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        select: {
          id: true,
          templateType: true,
          recipientEmail: true,
          recipientName: true,
          recipientType: true,
          recipientId: true,
          subject: true,
          status: true,
          sentAt: true,
          metadata: true
        }
      }),
      prisma.emailHistory.count({ where })
    ])

    // Parse metadata for each history item
    const historyWithParsedMetadata = history.map(item => ({
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : null
    }))

    return res.status(200).json({
      history: historyWithParsedMetadata,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error('Get email history error:', error)
    return res.status(500).json({ error: 'Failed to get email history' })
  }
}
