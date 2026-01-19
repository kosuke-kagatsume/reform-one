import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    // Get all archive IDs that this user has viewed
    const views = await prisma.archiveView.findMany({
      where: { userId },
      select: { archiveId: true },
      distinct: ['archiveId']
    })

    const watchedArchiveIds = views.map(v => v.archiveId)

    return res.status(200).json({ watchedArchiveIds })
  } catch (error) {
    console.error('Get watched archives error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
