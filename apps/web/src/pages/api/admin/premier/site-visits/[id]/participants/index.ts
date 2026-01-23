import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    if (req.method === 'GET') {
      const participants = await prisma.siteVisitParticipant.findMany({
        where: { siteVisitId: id },
        orderBy: { registeredAt: 'desc' },
      })

      return res.status(200).json(participants)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin site visit participants error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
