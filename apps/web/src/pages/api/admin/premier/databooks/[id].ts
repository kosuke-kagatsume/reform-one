import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Admin API for managing a single databook
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add admin authentication check

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid databook ID' })
  }

  if (req.method === 'GET') {
    try {
      const databook = await prisma.databook.findUnique({
        where: { id },
        include: {
          _count: {
            select: { downloads: true }
          }
        }
      })

      if (!databook) {
        return res.status(404).json({ error: 'Databook not found' })
      }

      return res.status(200).json({ databook })
    } catch (error) {
      console.error('Get databook error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const { title, description, pdfUrl, youtubeUrl, quarter, isPublished } = req.body

    try {
      const existing = await prisma.databook.findUnique({ where: { id } })
      if (!existing) {
        return res.status(404).json({ error: 'Databook not found' })
      }

      const databook = await prisma.databook.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          description: description !== undefined ? description : existing.description,
          pdfUrl: pdfUrl ?? existing.pdfUrl,
          youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : existing.youtubeUrl,
          quarter: quarter ?? existing.quarter,
          isPublished: isPublished ?? existing.isPublished,
          // Update publishedAt when first published
          ...(isPublished && !existing.isPublished ? { publishedAt: new Date() } : {})
        }
      })

      return res.status(200).json({ databook })
    } catch (error) {
      console.error('Update databook error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.databook.delete({ where: { id } })
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete databook error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
