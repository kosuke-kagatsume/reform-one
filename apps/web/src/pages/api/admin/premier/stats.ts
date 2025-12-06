import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [
      totalOrganizations,
      activeSubscriptions,
      upcomingSeminars,
      totalArchives,
      communityCategories,
      totalMembers
    ] = await Promise.all([
      prisma.organization.count({
        where: { type: 'CUSTOMER' }
      }),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.seminar.count({
        where: {
          scheduledAt: { gte: new Date() }
        }
      }),
      prisma.archive.count(),
      prisma.communityCategory.count(),
      prisma.userOrganization.count({
        where: {
          organization: { type: 'CUSTOMER' }
        }
      })
    ])

    return res.status(200).json({
      totalOrganizations,
      activeSubscriptions,
      upcomingSeminars,
      totalArchives,
      communityCategories,
      totalMembers
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
