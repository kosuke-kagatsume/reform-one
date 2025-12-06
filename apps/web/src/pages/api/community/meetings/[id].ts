import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'GET') {
    try {
      const meeting = await prisma.meetingArchive.findUnique({
        where: { id },
        include: { category: true }
      })

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' })
      }

      return res.status(200).json({ meeting })
    } catch (error) {
      console.error('Get meeting error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const { title, description, youtubeUrl, heldAt } = req.body

    if (!title || !youtubeUrl || !heldAt) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const meeting = await prisma.meetingArchive.update({
        where: { id },
        data: {
          title,
          description,
          youtubeUrl,
          heldAt: new Date(heldAt)
        },
        include: { category: true }
      })

      return res.status(200).json({ meeting })
    } catch (error) {
      console.error('Update meeting error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.meetingArchive.delete({
        where: { id }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete meeting error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
