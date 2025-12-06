import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// Verify Stripe checkout session and activate subscription
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' })
  }

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      // Development mode - just activate the subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          stripeSubscriptionId: sessionId,
          status: 'PENDING',
        },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'ACTIVE' },
        })

        // Create entitlements
        const entitlements =
          subscription.planType === 'EXPERT'
            ? ['seminar', 'archive', 'community', 'databook', 'newsletter']
            : ['seminar', 'archive']

        for (const feature of entitlements) {
          await prisma.entitlement.upsert({
            where: {
              subscriptionId_feature: {
                subscriptionId: subscription.id,
                feature,
              },
            },
            create: {
              subscriptionId: subscription.id,
              feature,
            },
            update: {},
          })
        }
      }

      return res.status(200).json({
        success: true,
        devMode: true,
      })
    }

    // Production mode - verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    const organizationId = session.metadata?.organizationId
    const planType = session.metadata?.planType

    if (!organizationId || !planType) {
      return res.status(400).json({ error: 'Invalid session metadata' })
    }

    // Find and activate subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string || session.id,
        },
      })

      // Create invoice record
      const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          stripeInvoiceId: session.payment_intent as string || session.id,
          amount: session.amount_total || 0,
          status: 'paid',
          invoiceNumber,
          paidAt: new Date(),
        },
      })

      // Create entitlements based on plan type
      const entitlements =
        planType === 'EXPERT'
          ? ['seminar', 'archive', 'community', 'databook', 'newsletter']
          : ['seminar', 'archive']

      for (const feature of entitlements) {
        await prisma.entitlement.upsert({
          where: {
            subscriptionId_feature: {
              subscriptionId: subscription.id,
              feature,
            },
          },
          create: {
            subscriptionId: subscription.id,
            feature,
          },
          update: {},
        })
      }
    }

    return res.status(200).json({
      success: true,
      organizationId,
      planType,
    })
  } catch (error) {
    console.error('Verify session error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
