import type { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import { constructWebhookEvent, stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const signature = req.headers['stripe-signature']
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  let event: Stripe.Event

  try {
    const buf = await buffer(req)
    event = constructWebhookEvent({ body: buf, signature })
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { type, siteVisitId, qualificationId, participantId, userId, organizationId } = session.metadata || {}

  // 決済履歴を更新
  await prisma.payment.updateMany({
    where: { stripeSessionId: session.id },
    data: {
      status: 'COMPLETED',
      stripePaymentIntentId: session.payment_intent as string,
      paidAt: new Date(),
    },
  })

  // タイプ別処理
  if (type === 'site_visit' && participantId) {
    await prisma.siteVisitParticipant.update({
      where: { id: participantId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    })
  }

  if (type === 'qualification' && userId && qualificationId) {
    // 資格受講の場合、ステータスを更新
    await prisma.userQualification.updateMany({
      where: {
        userId,
        qualificationId,
      },
      data: {
        status: 'ENROLLED',
      },
    })
  }

  console.log(`Checkout completed: ${session.id}, type: ${type}`)
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'COMPLETED',
      paidAt: new Date(),
    },
  })

  console.log(`Payment succeeded: ${paymentIntent.id}`)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'FAILED',
    },
  })

  console.log(`Payment failed: ${paymentIntent.id}`)
}

async function handleRefund(charge: Stripe.Charge) {
  if (charge.payment_intent) {
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: charge.payment_intent as string },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
      },
    })
  }

  console.log(`Refund processed: ${charge.id}`)
}
