import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'GET') {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' }
          },
          users: {
            include: {
              user: true
            }
          },
          invitations: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' })
      }

      return res.status(200).json({ organization })
    } catch (error) {
      console.error('Get organization error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const { name, slug, planType, status, startDate, endDate } = req.body

    try {
      // Update organization
      const organization = await prisma.organization.update({
        where: { id },
        data: {
          name,
          slug
        }
      })

      // Update active subscription if plan details changed
      if (planType || status || startDate || endDate) {
        const activeSubscription = await prisma.subscription.findFirst({
          where: {
            organizationId: id,
            status: 'ACTIVE'
          }
        })

        if (activeSubscription) {
          await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
              planType: planType || activeSubscription.planType,
              status: status || activeSubscription.status,
              currentPeriodStart: startDate ? new Date(startDate) : activeSubscription.currentPeriodStart,
              currentPeriodEnd: endDate ? new Date(endDate) : activeSubscription.currentPeriodEnd,
              basePrice: planType === 'EXPERT' ? 220000 : planType === 'STANDARD' ? 110000 : activeSubscription.basePrice,
              finalPrice: planType === 'EXPERT' ? 165000 : planType === 'STANDARD' ? 55000 : activeSubscription.finalPrice
            }
          })
        }
      }

      return res.status(200).json({ organization })
    } catch (error) {
      console.error('Update organization error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Delete related records first
      await prisma.invitation.deleteMany({ where: { organizationId: id } })
      await prisma.userOrganization.deleteMany({ where: { organizationId: id } })
      await prisma.subscription.deleteMany({ where: { organizationId: id } })

      await prisma.organization.delete({
        where: { id }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete organization error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
