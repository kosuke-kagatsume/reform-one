import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Admin API for managing newsletters
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add admin authentication check

  if (req.method === 'GET') {
    try {
      const { includeUnpublished } = req.query

      const where = includeUnpublished === 'true' ? {} : { isPublished: true }

      const newsletters = await prisma.newsletter.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      return res.status(200).json({ newsletters })
    } catch (error) {
      console.error('Get newsletters error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { title, content, summary, authorId, isPublished } = req.body

    if (!title || !content || !authorId) {
      return res.status(400).json({ error: 'タイトル、本文、著者IDは必須です' })
    }

    try {
      const newsletter = await prisma.newsletter.create({
        data: {
          title,
          content,
          summary: summary || null,
          authorId,
          isPublished: isPublished ?? false
        }
      })

      return res.status(201).json({ newsletter })
    } catch (error) {
      console.error('Create newsletter error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
