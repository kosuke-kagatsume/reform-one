import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const categories = await prisma.seminarCategory.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { archives: true }
          }
        }
      })

      return res.status(200).json({ categories })
    } catch (error) {
      console.error('Get archive categories error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
