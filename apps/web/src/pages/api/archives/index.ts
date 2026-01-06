import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { categoryId, search, limit, offset } = req.query

    try {
      const where: any = {}

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } }
        ]
      }

      const archives = await prisma.archive.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: { views: true }
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: limit ? parseInt(limit as string) : 50,
        skip: offset ? parseInt(offset as string) : 0
      })

      const total = await prisma.archive.count({ where })

      return res.status(200).json({ archives, total })
    } catch (error) {
      console.error('Get archives error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
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
      const archive = await prisma.archive.create({
        data: {
          categoryId,
          title,
          description,
          youtubeUrl,
          thumbnailUrl,
          duration,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
          shortVersionUrl,
          shortVersionDuration
        },
        include: { category: true }
      })

      return res.status(201).json({ archive })
    } catch (error) {
      console.error('Create archive error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
