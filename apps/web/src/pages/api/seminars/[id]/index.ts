import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'GET') {
    try {
      const seminar = await prisma.seminar.findUnique({
        where: { id },
        include: {
          category: true,
          _count: {
            select: { participants: true }
          }
        }
      })

      if (!seminar) {
        return res.status(404).json({ error: 'Seminar not found' })
      }

      return res.status(200).json({ seminar })
    } catch (error) {
      console.error('Get seminar error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const { categoryId, title, description, instructor, imageUrl, zoomUrl, scheduledAt, duration, isPublic, publicPrice } = req.body

    if (!categoryId || !title || !scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const seminar = await prisma.seminar.update({
        where: { id },
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

      return res.status(200).json({ seminar })
    } catch (error) {
      console.error('Update seminar error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.seminar.delete({
        where: { id }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete seminar error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
