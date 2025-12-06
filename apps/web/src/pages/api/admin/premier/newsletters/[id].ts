import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Admin API for managing a single newsletter
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add admin authentication check

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid newsletter ID' })
  }

  if (req.method === 'GET') {
    try {
      const newsletter = await prisma.newsletter.findUnique({
        where: { id }
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

  if (req.method === 'PUT') {
    const { title, content, summary, isPublished } = req.body

    try {
      const existing = await prisma.newsletter.findUnique({ where: { id } })
      if (!existing) {
        return res.status(404).json({ error: 'Newsletter not found' })
      }

      const newsletter = await prisma.newsletter.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          content: content ?? existing.content,
          summary: summary !== undefined ? summary : existing.summary,
          isPublished: isPublished ?? existing.isPublished
        }
      })

      return res.status(200).json({ newsletter })
    } catch (error) {
      console.error('Update newsletter error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.newsletter.delete({ where: { id } })
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete newsletter error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
