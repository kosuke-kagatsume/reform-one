import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if recommendation exists
    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
    })

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' })
    }

    // Create or update dismissal
    await prisma.recommendationDismissal.upsert({
      where: {
        recommendationId_userId: {
          recommendationId: id,
          userId: auth.userId,
        },
      },
      create: {
        recommendationId: id,
        userId: auth.userId,
      },
      update: {
        dismissedAt: new Date(),
      },
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Dismiss recommendation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
