import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Admin API to manually activate a subscription (for bank transfer payments)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const { adminUserId, notes } = req.body

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid subscription ID' })
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { organization: true }
    })

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    if (subscription.status === 'ACTIVE') {
      return res.status(400).json({ error: '既にアクティブな契約です' })
    }

    // Activate the subscription
    await prisma.subscription.update({
      where: { id },
      data: { status: 'ACTIVE' }
    })

    // Update any open invoices to paid
    await prisma.invoice.updateMany({
      where: {
        subscriptionId: id,
        status: 'open'
      },
      data: {
        status: 'paid',
        paidAt: new Date()
      }
    })

    // Create entitlements based on plan type
    const features =
      subscription.planType === 'EXPERT'
        ? ['seminar', 'archive', 'community', 'databook', 'newsletter']
        : ['seminar', 'archive']

    for (const feature of features) {
      await prisma.entitlement.upsert({
        where: {
          subscriptionId_feature: {
            subscriptionId: id,
            feature
          }
        },
        update: {},
        create: {
          subscriptionId: id,
          feature
        }
      })
    }

    // Log the manual activation
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        orgId: subscription.organizationId,
        action: 'subscription.manual_activation',
        resource: `subscription:${id}`,
        metadata: JSON.stringify({
          planType: subscription.planType,
          paymentMethod: subscription.paymentMethod,
          notes: notes || null
        })
      }
    })

    return res.status(200).json({
      success: true,
      message: '契約が有効化されました'
    })
  } catch (error) {
    console.error('Activate subscription error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
