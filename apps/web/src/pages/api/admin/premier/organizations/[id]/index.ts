import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { calculatePrice } from '@/types/premier'
import type { PlanType, DiscountType } from '@/types/premier'

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
    const { name, slug, planType, discountType, status, startDate, endDate, existingSubscriptionTypes, adminNotes } = req.body

    try {
      const organization = await prisma.organization.update({
        where: { id },
        data: {
          name,
          slug,
          existingSubscriptionTypes: existingSubscriptionTypes !== undefined
            ? JSON.stringify(existingSubscriptionTypes)
            : undefined,
          adminNotes: adminNotes !== undefined ? (adminNotes || null) : undefined
        }
      })

      if (planType || discountType || status || startDate || endDate) {
        const activeSubscription = await prisma.subscription.findFirst({
          where: {
            organizationId: id,
            status: 'ACTIVE'
          }
        })

        if (activeSubscription) {
          const newPlanType = (planType || activeSubscription.planType) as PlanType
          const newDiscountType = (discountType || activeSubscription.discountType || 'NONE') as DiscountType
          const pricing = calculatePrice(newPlanType, newDiscountType)

          await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
              planType: newPlanType,
              discountType: newDiscountType,
              status: status || activeSubscription.status,
              currentPeriodStart: startDate ? new Date(startDate) : activeSubscription.currentPeriodStart,
              currentPeriodEnd: endDate ? new Date(endDate) : activeSubscription.currentPeriodEnd,
              basePrice: pricing.basePrice,
              discountPercent: pricing.discountPercent,
              discountAmount: pricing.discountAmount,
              finalPrice: pricing.finalPrice
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
