import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { target, loginFilter, planFilter, orgFilter } = req.query

    // Build where clause based on target
    const whereClause: any = {
      organizations: {
        some: {
          organization: {
            type: { not: 'REFORM_COMPANY' }
          }
        }
      }
    }

    // Apply plan filter
    if (target === 'expert') {
      whereClause.organizations.some.organization.subscriptions = {
        some: {
          planType: 'EXPERT',
          status: 'ACTIVE'
        }
      }
    } else if (target === 'standard') {
      whereClause.organizations.some.organization.subscriptions = {
        some: {
          planType: 'STANDARD',
          status: 'ACTIVE'
        }
      }
    } else if (target === 'filtered') {
      // Apply additional filters for filtered target
      if (planFilter === 'expert') {
        whereClause.organizations.some.organization.subscriptions = {
          some: { planType: 'EXPERT', status: 'ACTIVE' }
        }
      } else if (planFilter === 'standard') {
        whereClause.organizations.some.organization.subscriptions = {
          some: { planType: 'STANDARD', status: 'ACTIVE' }
        }
      }

      if (orgFilter && orgFilter !== 'all') {
        whereClause.organizations.some.organizationId = orgFilter
      }

      // Login filter
      if (loginFilter && loginFilter !== 'all') {
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        switch (loginFilter) {
          case 'recent':
            whereClause.lastLoginAt = { gte: sevenDaysAgo }
            break
          case 'normal':
            whereClause.lastLoginAt = {
              lt: sevenDaysAgo,
              gte: thirtyDaysAgo
            }
            break
          case 'inactive':
            whereClause.lastLoginAt = { lt: thirtyDaysAgo }
            break
          case 'never':
            whereClause.lastLoginAt = null
            break
        }
      }
    }

    const members = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        organizations: {
          select: {
            organization: {
              select: {
                name: true,
                subscriptions: {
                  where: { status: 'ACTIVE' },
                  select: {
                    planType: true
                  },
                  take: 1
                }
              }
            }
          },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    })

    const recipients = members.map(m => {
      const userOrg = m.organizations[0]
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        organizationName: userOrg?.organization?.name || '',
        planType: userOrg?.organization?.subscriptions?.[0]?.planType || null
      }
    })

    res.status(200).json({ recipients })
  } catch (error) {
    console.error('Failed to fetch recipients:', error)
    res.status(500).json({ error: 'Failed to fetch recipients' })
  }
}
