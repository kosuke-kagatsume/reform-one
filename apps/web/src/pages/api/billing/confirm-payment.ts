import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Confirm payment and activate subscription
// This would be called by webhook in production (Stripe, etc.)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { subscriptionId, paymentId, paidAt } = req.body

  if (!subscriptionId) {
    return res.status(400).json({ error: 'Subscription ID is required' })
  }

  try {
    // Get the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        organization: true,
        invoices: {
          where: { status: 'open' }
        }
      }
    })

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    if (subscription.status === 'ACTIVE') {
      return res.status(400).json({ error: 'Subscription is already active' })
    }

    // Activate the subscription
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        stripeSubscriptionId: paymentId || null
      }
    })

    // Update invoice if exists
    if (subscription.invoices.length > 0) {
      await prisma.invoice.updateMany({
        where: {
          subscriptionId,
          status: 'open'
        },
        data: {
          status: 'paid',
          paidAt: paidAt ? new Date(paidAt) : new Date()
        }
      })
    }

    // Create entitlements based on plan type
    const features =
      subscription.planType === 'EXPERT'
        ? ['seminar', 'archive', 'community', 'databook', 'newsletter']
        : ['seminar', 'archive']

    for (const feature of features) {
      await prisma.entitlement.upsert({
        where: {
          subscriptionId_feature: {
            subscriptionId,
            feature
          }
        },
        update: {},
        create: {
          subscriptionId,
          feature
        }
      })
    }

    // Log the activation
    await prisma.auditLog.create({
      data: {
        orgId: subscription.organizationId,
        action: 'subscription.activated',
        resource: `subscription:${subscriptionId}`,
        metadata: JSON.stringify({
          planType: subscription.planType,
          paymentMethod: subscription.paymentMethod,
          finalPrice: subscription.finalPrice
        })
      }
    })

    return res.status(200).json({
      success: true,
      subscription: {
        id: subscription.id,
        planType: subscription.planType,
        status: 'ACTIVE'
      }
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
