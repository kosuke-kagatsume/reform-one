import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { categoryId } = req.query

    try {
      const where: any = {}

      if (categoryId) {
        where.categoryId = categoryId
      }

      const meetings = await prisma.meetingArchive.findMany({
        where,
        include: { category: true },
        orderBy: { heldAt: 'desc' }
      })

      return res.status(200).json({ meetings })
    } catch (error) {
      console.error('Get meetings error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { categoryId, title, description, youtubeUrl, heldAt } = req.body

    if (!categoryId || !title || !youtubeUrl || !heldAt) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const meeting = await prisma.meetingArchive.create({
        data: {
          categoryId,
          title,
          description,
          youtubeUrl,
          heldAt: new Date(heldAt)
        },
        include: { category: true }
      })

      return res.status(201).json({ meeting })
    } catch (error) {
      console.error('Create meeting error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
