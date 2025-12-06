import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// User API for viewing published newsletters (Expert plan only)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const newsletters = await prisma.newsletter.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        summary: true,
        sentAt: true,
        createdAt: true
      },
      orderBy: { sentAt: 'desc' }
    })

    return res.status(200).json({ newsletters })
  } catch (error) {
    console.error('Get newsletters error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
