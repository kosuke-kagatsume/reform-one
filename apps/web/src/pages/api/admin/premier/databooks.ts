import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Admin API for managing databooks
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add admin authentication check

  if (req.method === 'GET') {
    try {
      const { includeUnpublished } = req.query

      const where = includeUnpublished === 'true' ? {} : { isPublished: true }

      const databooks = await prisma.databook.findMany({
        where,
        include: {
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

  if (req.method === 'POST') {
    const { title, description, pdfUrl, youtubeUrl, quarter, isPublished } = req.body

    if (!title || !pdfUrl || !quarter) {
      return res.status(400).json({ error: 'タイトル、PDF URL、四半期は必須です' })
    }

    try {
      const databook = await prisma.databook.create({
        data: {
          title,
          description: description || null,
          pdfUrl,
          youtubeUrl: youtubeUrl || null,
          quarter,
          isPublished: isPublished ?? false,
          publishedAt: isPublished ? new Date() : new Date()
        }
      })

      return res.status(201).json({ databook })
    } catch (error) {
      console.error('Create databook error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
