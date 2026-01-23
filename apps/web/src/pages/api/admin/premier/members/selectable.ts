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

    // Get all customer users with their organizations
    const userOrgs = await prisma.userOrganization.findMany({
      where: {
        organization: {
          type: 'CUSTOMER'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              take: 1,
              select: { planType: true }
            }
          }
        }
      }
    })

    const members = userOrgs.map(uo => ({
      id: uo.user.id,
      name: uo.user.name,
      email: uo.user.email,
      organizationId: uo.organization.id,
      organizationName: uo.organization.name,
      planType: uo.organization.subscriptions[0]?.planType || null
    }))

    return res.status(200).json({ members })
  } catch (error) {
    console.error('Get selectable members error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
