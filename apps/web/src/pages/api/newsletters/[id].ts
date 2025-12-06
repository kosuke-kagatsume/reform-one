import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// User API for viewing a single newsletter (Expert plan only)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid newsletter ID' })
  }

  try {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id, isPublished: true }
    })

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' })
    }

    return res.status(200).json({ newsletter })
  } catch (error) {
    console.error('Get newsletter error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
