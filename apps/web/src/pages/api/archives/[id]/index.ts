import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Archive ID is required' })
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

  return res.status(405).json({ error: 'Method not allowed' })
}
