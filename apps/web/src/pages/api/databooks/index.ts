import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// User API for viewing published databooks (Expert plan only)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const databooks = await prisma.databook.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        youtubeUrl: true,
        quarter: true,
        publishedAt: true,
        _count: {
          select: { downloads: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    })

    return res.status(200).json({ databooks })
  } catch (error) {
    console.error('Get databooks error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
