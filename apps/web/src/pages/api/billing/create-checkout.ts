import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession, PLAN_PRICES } from '@/lib/stripe'

// Create checkout session for subscription
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { organizationId, planType, paymentMethod, userEmail } = req.body

  if (!organizationId || !planType || !paymentMethod) {
    return res.status(400).json({ error: '必須項目が不足しています' })
  }

  try {
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'PENDING'] } }
        },
        users: {
          include: {
            user: {
              select: { email: true, name: true }
            }
          },
          where: { role: 'ADMIN' },
          take: 1
        }
      }
    })

    if (!organization) {
      return res.status(404).json({ error: '組織が見つかりません' })
    }

    // Check for existing active subscription
    if (organization.subscriptions.length > 0) {
      return res.status(400).json({ error: '既にアクティブな契約があります' })
    }

    // Get admin email
    const adminEmail = userEmail || organization.users[0]?.user?.email
    if (!adminEmail) {
      return res.status(400).json({ error: '管理者のメールアドレスが見つかりません' })
    }

    // Calculate prices
    const planPrice = PLAN_PRICES[planType as keyof typeof PLAN_PRICES]
    if (!planPrice) {
      return res.status(400).json({ error: '無効なプランです' })
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (paymentMethod === 'CARD') {
      // Check if Stripe is configured
      if (process.env.STRIPE_SECRET_KEY) {
        // Create Stripe checkout session
        const session = await createCheckoutSession({
          organizationId,
          organizationName: organization.name,
          planType: planType as 'STANDARD' | 'EXPERT',
          customerEmail: adminEmail,
          isFirstYear: true,
          successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/checkout/cancel`,
        })

        // Create pending subscription
        await prisma.subscription.create({
          data: {
            organizationId,
            planType,
            status: 'PENDING',
            paymentMethod: 'CARD',
            basePrice: planPrice.amount,
            discountPercent: ((planPrice.amount - planPrice.discountedAmount) / planPrice.amount) * 100,
            discountAmount: planPrice.amount - planPrice.discountedAmount,
            finalPrice: planPrice.discountedAmount,
            autoRenewal: true,
            stripeSubscriptionId: session.id, // Store session ID temporarily
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd
          }
        })

        return res.status(200).json({
          checkoutUrl: session.url,
          sessionId: session.id,
          paymentMethod: 'CARD'
        })
      } else {
        // Fallback for development without Stripe
        const subscription = await prisma.subscription.create({
          data: {
            organizationId,
            planType,
            status: 'PENDING',
            paymentMethod: 'CARD',
            basePrice: planPrice.amount,
            discountPercent: ((planPrice.amount - planPrice.discountedAmount) / planPrice.amount) * 100,
            discountAmount: planPrice.amount - planPrice.discountedAmount,
            finalPrice: planPrice.discountedAmount,
            autoRenewal: true,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd
          }
        })

        const checkoutUrl = `${baseUrl}/checkout/confirm?subscription=${subscription.id}`

        return res.status(200).json({
          checkoutUrl,
          subscriptionId: subscription.id,
          paymentMethod: 'CARD',
          devMode: true
        })
      }
    } else if (paymentMethod === 'BANK_TRANSFER') {
      // For bank transfer, create pending subscription and show bank details
      const subscription = await prisma.subscription.create({
        data: {
          organizationId,
          planType,
          status: 'PENDING',
          paymentMethod: 'BANK_TRANSFER',
          basePrice: planPrice.amount,
          discountPercent: ((planPrice.amount - planPrice.discountedAmount) / planPrice.amount) * 100,
          discountAmount: planPrice.amount - planPrice.discountedAmount,
          finalPrice: planPrice.discountedAmount,
          autoRenewal: false, // Bank transfer doesn't support auto-renewal
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd
        }
      })

      // Create invoice for bank transfer
      const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          stripeInvoiceId: `manual-${subscription.id}`,
          amount: planPrice.discountedAmount,
          status: 'open',
          invoiceNumber,
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days
        }
      })

      return res.status(200).json({
        subscriptionId: subscription.id,
        paymentMethod: 'BANK_TRANSFER',
        bankDetails: {
          bankName: '三菱UFJ銀行',
          branchName: '新橋支店',
          accountType: '普通',
          accountNumber: '1234567',
          accountHolder: 'カ）リフォームサンギョウシンブンシャ',
          amount: planPrice.discountedAmount,
          invoiceNumber
        }
      })
    } else if (paymentMethod === 'CONVENIENCE_STORE') {
      // For convenience store payment, create pending subscription
      const subscription = await prisma.subscription.create({
        data: {
          organizationId,
          planType,
          status: 'PENDING',
          paymentMethod: 'CONVENIENCE_STORE',
          basePrice: planPrice.amount,
          discountPercent: ((planPrice.amount - planPrice.discountedAmount) / planPrice.amount) * 100,
          discountAmount: planPrice.amount - planPrice.discountedAmount,
          finalPrice: planPrice.discountedAmount,
          autoRenewal: false, // Convenience store doesn't support auto-renewal
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd
        }
      })

      // Generate payment slip number
      const paymentCode = `CVS-${Math.random().toString(36).substr(2, 12).toUpperCase()}`

      return res.status(200).json({
        subscriptionId: subscription.id,
        paymentMethod: 'CONVENIENCE_STORE',
        convenienceStore: {
          paymentCode,
          amount: planPrice.discountedAmount,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
          instructions: 'お近くのコンビニエンスストアで支払い番号を提示してお支払いください。'
        }
      })
    }

    return res.status(400).json({ error: '無効な支払い方法です' })
  } catch (error) {
    console.error('Create checkout error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
