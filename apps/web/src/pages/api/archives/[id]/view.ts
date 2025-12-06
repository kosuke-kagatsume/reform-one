import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Check if archive exists
    const archive = await prisma.archive.findUnique({
      where: { id }
    })

    if (!archive) {
      return res.status(404).json({ error: 'Archive not found' })
    }

    // Create view record
    const view = await prisma.archiveView.create({
      data: {
        archiveId: id,
        userId
      }
    })

    return res.status(201).json({ view })
  } catch (error) {
    console.error('Record view error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
