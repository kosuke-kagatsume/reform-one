import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get site visit
    const siteVisit = await prisma.siteVisit.findUnique({
      where: { id },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    })

    if (!siteVisit) {
      return res.status(404).json({ error: 'Site visit not found' })
    }

    if (!siteVisit.isPublished) {
      return res.status(400).json({ error: 'Site visit is not published' })
    }

    if (siteVisit.isCanceled) {
      return res.status(400).json({ error: 'Site visit is canceled' })
    }

    if (siteVisit.scheduledAt < new Date()) {
      return res.status(400).json({ error: 'Site visit has already passed' })
    }

    if (siteVisit._count.participants >= siteVisit.capacity) {
      return res.status(400).json({ error: 'Site visit is full' })
    }

    // Check if already registered
    const existingRegistration = await prisma.siteVisitParticipant.findUnique({
      where: {
        siteVisitId_userId: {
          siteVisitId: id,
          userId: auth.userId,
        },
      },
    })

    if (existingRegistration) {
      if (existingRegistration.status === 'CANCELED') {
        // Re-register
        await prisma.siteVisitParticipant.update({
          where: { id: existingRegistration.id },
          data: {
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            registeredAt: new Date(),
          },
        })
      } else {
        return res.status(400).json({ error: 'Already registered' })
      }
    }

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: auth.userId },
    })

    // Create registration
    const registration = await prisma.siteVisitParticipant.create({
      data: {
        siteVisitId: id,
        userId: auth.userId,
        organizationId: userOrg?.organizationId,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
    })

    // If price is 0, auto-confirm
    if (siteVisit.price === 0) {
      await prisma.siteVisitParticipant.update({
        where: { id: registration.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paidAt: new Date(),
        },
      })

      return res.status(200).json({
        success: true,
        registration: {
          ...registration,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
        paymentRequired: false,
      })
    }

    // Create Stripe checkout session for paid site visits
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (process.env.STRIPE_SECRET_KEY) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'jpy',
              product_data: {
                name: `視察会: ${siteVisit.title}`,
                description: `${siteVisit.location} - ${siteVisit.scheduledAt.toLocaleDateString('ja-JP')}`,
              },
              unit_amount: Math.round(siteVisit.price),
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: 'site_visit',
          siteVisitId: id,
          participantId: registration.id,
          userId: auth.userId,
        },
        success_url: `${baseUrl}/dashboard/site-visits/${id}?success=true`,
        cancel_url: `${baseUrl}/dashboard/site-visits/${id}?canceled=true`,
      })

      // Update registration with stripe session ID
      await prisma.siteVisitParticipant.update({
        where: { id: registration.id },
        data: {
          stripePaymentIntentId: session.id,
        },
      })

      return res.status(200).json({
        success: true,
        registration,
        paymentRequired: true,
        checkoutUrl: session.url,
      })
    }

    // Development mode - no Stripe
    return res.status(200).json({
      success: true,
      registration,
      paymentRequired: true,
      message: 'Payment required. Stripe not configured in development.',
    })
  } catch (error) {
    console.error('Register for site visit error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
