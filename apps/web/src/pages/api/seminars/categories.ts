import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const categories = await prisma.seminarCategory.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: {
              seminars: true,
              archives: true
            }
          }
        }
      })

      // 10分キャッシュ - カテゴリはほとんど変更されない
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
      return res.status(200).json({ categories })
    } catch (error) {
      console.error('Get categories error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { name, slug, description, sortOrder } = req.body

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' })
    }

    try {
      const category = await prisma.seminarCategory.create({
        data: {
          name,
          slug,
          description,
          sortOrder: sortOrder || 0
        }
      })

      return res.status(201).json({ category })
    } catch (error) {
      console.error('Create category error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
