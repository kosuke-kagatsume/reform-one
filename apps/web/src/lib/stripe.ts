// Stripe utility for Premier Subscription
import Stripe from 'stripe'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

// Plan price IDs (create these in Stripe Dashboard)
export const PLAN_PRICES = {
  STANDARD: {
    priceId: process.env.STRIPE_STANDARD_PRICE_ID || 'price_standard',
    amount: 110000, // 11万円
    discountedAmount: 55000, // 初年度5.5万円
  },
  EXPERT: {
    priceId: process.env.STRIPE_EXPERT_PRICE_ID || 'price_expert',
    amount: 220000, // 22万円
    discountedAmount: 165000, // 初年度16.5万円
  },
}

interface CreateCheckoutSessionParams {
  organizationId: string
  organizationName: string
  planType: 'STANDARD' | 'EXPERT'
  customerEmail: string
  isFirstYear?: boolean
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const { organizationId, organizationName, planType, customerEmail, isFirstYear = true, successUrl, cancelUrl } = params

  const planPrice = PLAN_PRICES[planType]
  const amount = isFirstYear ? planPrice.discountedAmount : planPrice.amount

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment', // One-time payment for annual subscription
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: `プレミア購読 ${planType === 'STANDARD' ? 'スタンダード' : 'エキスパート'}プラン（年額）`,
            description: isFirstYear
              ? '初年度特別価格'
              : '年額プラン',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      organizationId,
      organizationName,
      planType,
      isFirstYear: String(isFirstYear),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: 'ja',
  })

  return session
}

interface CreateSubscriptionParams {
  customerId: string
  priceId: string
  metadata?: Record<string, string>
}

export async function createSubscription(params: CreateSubscriptionParams): Promise<Stripe.Subscription> {
  const { customerId, priceId, metadata } = params

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
    metadata,
  })

  return subscription
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.cancel(subscriptionId)
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId)
}

interface CreateCustomerParams {
  email: string
  name: string
  organizationId: string
}

export async function createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
  const { email, name, organizationId } = params

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      organizationId,
    },
  })

  return customer
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  return stripe.customers.retrieve(customerId)
}

interface WebhookEventParams {
  body: string | Buffer
  signature: string
}

export function constructWebhookEvent(params: WebhookEventParams): Stripe.Event {
  const { body, signature } = params
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}

// Create a portal session for customer to manage billing
export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

// Get invoice
export async function getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  return stripe.invoices.retrieve(invoiceId)
}

// List customer invoices
export async function listInvoices(customerId: string, limit = 10): Promise<Stripe.ApiList<Stripe.Invoice>> {
  return stripe.invoices.list({
    customer: customerId,
    limit,
  })
}

export { stripe }
