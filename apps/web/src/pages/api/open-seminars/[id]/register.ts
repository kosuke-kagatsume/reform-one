import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// External user registration - no auth required
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const { name, email, company, phone } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Get seminar
    const seminar = await prisma.seminar.findUnique({
      where: { id },
    })

    if (!seminar || !seminar.isPublic) {
      return res.status(404).json({ error: 'Seminar not found' })
    }

    if (seminar.scheduledAt < new Date()) {
      return res.status(400).json({ error: 'Seminar has already passed' })
    }

    // Check if already registered
    const existing = await prisma.openSeminarRegistration.findFirst({
      where: {
        seminarId: id,
        email,
      },
    })

    if (existing) {
      return res.status(400).json({ error: 'Already registered with this email' })
    }

    // Create registration
    const registration = await prisma.openSeminarRegistration.create({
      data: {
        seminarId: id,
        name,
        email,
        company,
        phone,
        paymentStatus: seminar.publicPrice ? 'UNPAID' : 'PAID',
        paidAt: seminar.publicPrice ? null : new Date(),
      },
    })

    // If free, return success
    if (!seminar.publicPrice || seminar.publicPrice === 0) {
      return res.status(200).json({
        success: true,
        registration,
        paymentRequired: false,
      })
    }

    // Create Stripe checkout for paid seminars
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (process.env.STRIPE_SECRET_KEY) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'jpy',
              product_data: {
                name: `セミナー: ${seminar.title}`,
                description: seminar.scheduledAt.toLocaleDateString('ja-JP'),
              },
              unit_amount: Math.round(seminar.publicPrice),
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: 'open_seminar',
          seminarId: id,
          registrationId: registration.id,
          email,
        },
        success_url: `${baseUrl}/open-seminars/${id}/success?registrationId=${registration.id}`,
        cancel_url: `${baseUrl}/open-seminars/${id}?canceled=true`,
      })

      // Update registration with stripe session ID
      await prisma.openSeminarRegistration.update({
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
      message: 'Payment required. Stripe not configured.',
    })
  } catch (error) {
    console.error('Register for open seminar error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
