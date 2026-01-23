import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Get all customer organizations
    const orgs = await prisma.organization.findMany({
      where: { type: 'CUSTOMER' },
      include: {
        _count: {
          select: { users: true }
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          take: 1,
          select: { planType: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    const organizations = orgs.map(org => ({
      id: org.id,
      name: org.name,
      memberCount: org._count.users,
      planType: org.subscriptions[0]?.planType || null
    }))

    return res.status(200).json({ organizations })
  } catch (error) {
    console.error('Get selectable organizations error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
