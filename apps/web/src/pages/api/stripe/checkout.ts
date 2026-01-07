import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { stripe, PRODUCT_PRICES } from '@/lib/stripe'

interface CheckoutBody {
  type: 'site_visit' | 'qualification' | 'after_party'
  itemId?: string
  quantity?: number
  includeAfterParty?: boolean
  metadata?: Record<string, string>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { type, itemId, quantity = 1, includeAfterParty = false, metadata = {} } = req.body as CheckoutBody

    // ユーザー情報取得
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        organizations: {
          include: { organization: { include: { subscriptions: true } } },
          take: 1,
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const org = user.organizations[0]?.organization
    const subscription = org?.subscriptions?.[0]
    const planType = subscription?.planType || 'STANDARD'
    const isExpert = planType === 'EXPERT'

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const lineItems: { price_data: { currency: string; product_data: { name: string; description?: string }; unit_amount: number }; quantity: number }[] = []
    let totalAmount = 0
    let description = ''
    let successUrl = `${baseUrl}/dashboard`
    let cancelUrl = `${baseUrl}/dashboard`

    // タイプ別料金計算
    switch (type) {
      case 'site_visit': {
        if (!itemId) {
          return res.status(400).json({ error: 'itemId is required for site_visit' })
        }

        const siteVisit = await prisma.siteVisit.findUnique({ where: { id: itemId } })
        if (!siteVisit) {
          return res.status(404).json({ error: 'Site visit not found' })
        }

        // プラン別料金計算
        const prices = PRODUCT_PRICES.SITE_VISIT
        const freeSlots = isExpert ? prices.expertFreeSlots : 0
        const paidCount = Math.max(0, quantity - freeSlots)
        const unitPrice = isExpert ? prices.extraPerPerson : prices.standard
        const visitAmount = unitPrice * paidCount

        if (visitAmount > 0) {
          lineItems.push({
            price_data: {
              currency: 'jpy',
              product_data: {
                name: `視察会: ${siteVisit.title}`,
                description: `${siteVisit.location} - ${quantity}名参加`,
              },
              unit_amount: unitPrice,
            },
            quantity: paidCount,
          })
          totalAmount += visitAmount
        }

        // 懇親会オプション
        if (includeAfterParty) {
          const partyAmount = PRODUCT_PRICES.AFTER_PARTY.price * quantity
          lineItems.push({
            price_data: {
              currency: 'jpy',
              product_data: {
                name: '懇親会参加',
                description: `${quantity}名分`,
              },
              unit_amount: PRODUCT_PRICES.AFTER_PARTY.price,
            },
            quantity,
          })
          totalAmount += partyAmount
        }

        description = `視察会: ${siteVisit.title}`
        successUrl = `${baseUrl}/dashboard/site-visits/${itemId}?success=true`
        cancelUrl = `${baseUrl}/dashboard/site-visits/${itemId}?canceled=true`
        break
      }

      case 'qualification': {
        if (!itemId) {
          return res.status(400).json({ error: 'itemId is required for qualification' })
        }

        const qualification = await prisma.qualification.findUnique({ where: { id: itemId } })
        if (!qualification) {
          return res.status(404).json({ error: 'Qualification not found' })
        }

        // 無料枠チェック（組織の契約期間内の使用数を確認）
        const prices = PRODUCT_PRICES.QUALIFICATION
        const freeSlots = isExpert ? prices.expertFreeSlots : 0

        // 今年度の使用数をカウント（簡易実装）
        const usedSlots = 0 // TODO: 実際の使用数をDBから取得
        const remainingFree = Math.max(0, freeSlots - usedSlots)
        const paidCount = Math.max(0, quantity - remainingFree)
        const unitPrice = prices.extraPerPerson

        if (paidCount > 0) {
          lineItems.push({
            price_data: {
              currency: 'jpy',
              product_data: {
                name: `資格受講: ${qualification.name}`,
                description: `${quantity}名分`,
              },
              unit_amount: unitPrice,
            },
            quantity: paidCount,
          })
          totalAmount = unitPrice * paidCount
        }

        description = `資格受講: ${qualification.name}`
        successUrl = `${baseUrl}/dashboard/qualifications?success=true`
        cancelUrl = `${baseUrl}/dashboard/qualifications?canceled=true`
        break
      }

      default:
        return res.status(400).json({ error: 'Invalid checkout type' })
    }

    // 無料の場合
    if (totalAmount === 0 || lineItems.length === 0) {
      return res.status(200).json({
        success: true,
        paymentRequired: false,
        message: '無料枠が適用されました',
      })
    }

    // Stripe Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: lineItems,
      metadata: {
        type,
        itemId: itemId || '',
        userId: auth.userId,
        organizationId: org?.id || '',
        quantity: String(quantity),
        ...metadata,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'ja',
    })

    // 決済履歴を作成
    await prisma.payment.create({
      data: {
        organizationId: org?.id,
        userId: auth.userId,
        type: type.toUpperCase(),
        amount: totalAmount,
        status: 'PENDING',
        stripeSessionId: session.id,
        description,
        metadata: JSON.stringify({ itemId, quantity, includeAfterParty }),
      },
    })

    return res.status(200).json({
      success: true,
      paymentRequired: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
