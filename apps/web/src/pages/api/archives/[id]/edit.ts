import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'GET') {
    try {
      const archive = await prisma.archive.findUnique({
        where: { id },
        include: {
          category: true,
          _count: {
            select: { views: true }
          }
        }
      })

      if (!archive) {
        return res.status(404).json({ error: 'Archive not found' })
      }

      return res.status(200).json({ archive })
    } catch (error) {
      console.error('Get archive error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const {
      categoryId,
      title,
      description,
      youtubeUrl,
      thumbnailUrl,
      duration,
      publishedAt,
      shortVersionUrl,
      shortVersionDuration
    } = req.body

    if (!categoryId || !title || !youtubeUrl) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const archive = await prisma.archive.update({
        where: { id },
        data: {
          categoryId,
          title,
          description,
          youtubeUrl,
          thumbnailUrl,
          duration,
          publishedAt: publishedAt ? new Date(publishedAt) : undefined,
          shortVersionUrl,
          shortVersionDuration
        },
        include: { category: true }
      })

      return res.status(200).json({ archive })
    } catch (error) {
      console.error('Update archive error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.archive.delete({
        where: { id }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete archive error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
