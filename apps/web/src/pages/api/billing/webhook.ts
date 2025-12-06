import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { constructWebhookEvent } from '@/lib/stripe'
import { buffer } from 'micro'
import Stripe from 'stripe'

// Disable body parser for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature'] as string

  if (!sig) {
    return res.status(400).json({ error: 'Missing Stripe signature' })
  }

  let event: Stripe.Event

  try {
    const body = await buffer(req)
    event = constructWebhookEvent({
      body,
      signature: sig,
    })
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get organization ID from metadata
        const organizationId = session.metadata?.organizationId
        const planType = session.metadata?.planType

        if (!organizationId || !planType) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Find and update the subscription
        const subscription = await prisma.subscription.findFirst({
          where: {
            organizationId,
            status: 'PENDING',
            stripeSubscriptionId: session.id,
          },
        })

        if (subscription) {
          // Update subscription to active
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
              amount: (session.amount_total || 0) / 1, // Already in JPY
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

          console.log(`Subscription ${subscription.id} activated for organization ${organizationId}`)
        } else {
          // Create new subscription if not found
          const now = new Date()
          const periodEnd = new Date(now)
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)

          const newSubscription = await prisma.subscription.create({
            data: {
              organizationId,
              planType,
              status: 'ACTIVE',
              paymentMethod: 'CARD',
              basePrice: session.amount_total || 0,
              discountPercent: 0,
              discountAmount: 0,
              finalPrice: session.amount_total || 0,
              autoRenewal: true,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string || session.id,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
          })

          console.log(`New subscription ${newSubscription.id} created for organization ${organizationId}`)
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice

        // Find subscription by Stripe customer ID
        const subscription = await prisma.subscription.findFirst({
          where: {
            stripeCustomerId: invoice.customer as string,
            status: 'ACTIVE',
          },
        })

        if (subscription) {
          // Record the invoice
          const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

          await prisma.invoice.upsert({
            where: {
              stripeInvoiceId: invoice.id,
            },
            create: {
              subscriptionId: subscription.id,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid,
              status: 'paid',
              invoiceNumber,
              paidAt: new Date(),
              invoicePdf: invoice.invoice_pdf || undefined,
            },
            update: {
              status: 'paid',
              paidAt: new Date(),
              invoicePdf: invoice.invoice_pdf || undefined,
            },
          })

          // Extend subscription period for renewal
          if (invoice.billing_reason === 'subscription_cycle') {
            const newPeriodEnd = new Date(subscription.currentPeriodEnd)
            newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1)

            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                currentPeriodStart: subscription.currentPeriodEnd,
                currentPeriodEnd: newPeriodEnd,
                renewalNotifiedAt: null, // Reset notification flag
              },
            })

            console.log(`Subscription ${subscription.id} renewed until ${newPeriodEnd}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        const subscription = await prisma.subscription.findFirst({
          where: {
            stripeCustomerId: invoice.customer as string,
          },
        })

        if (subscription) {
          // Mark subscription as suspended after payment failure
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'SUSPENDED',
            },
          })

          console.log(`Subscription ${subscription.id} suspended due to payment failure`)

          // TODO: Send payment failure notification email
        }
        break
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as Stripe.Subscription

        const subscription = await prisma.subscription.findFirst({
          where: {
            stripeSubscriptionId: stripeSubscription.id,
          },
        })

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'CANCELLED',
              canceledAt: new Date(),
            },
          })

          console.log(`Subscription ${subscription.id} cancelled`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
