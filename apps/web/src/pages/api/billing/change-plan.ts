import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subscriptionId, userId, newPlan } = req.body

    if (!subscriptionId || !userId || !newPlan) {
      return res.status(400).json({ error: '必須パラメータが不足しています' })
    }

    if (!['EXPERT', 'STANDARD'].includes(newPlan)) {
      return res.status(400).json({ error: '無効なプランです' })
    }

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        organization: true
      }
    })

    if (!subscription) {
      return res.status(404).json({ error: '契約が見つかりません' })
    }

    if (subscription.planType === newPlan) {
      return res.status(400).json({ error: '既に同じプランです' })
    }

    const currentPlan = subscription.planType
    const isUpgrade = currentPlan === 'STANDARD' && newPlan === 'EXPERT'

    if (isUpgrade) {
      // Upgrade: Standard -> Expert (即時反映)
      // Calculate prorated amount
      const now = new Date()
      const periodEnd = new Date(subscription.currentPeriodEnd)
      const periodStart = new Date(subscription.currentPeriodStart)
      const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
      const remainingDays = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Price difference: Expert (220,000) - Standard (110,000) = 110,000
      const priceDifference = 110000
      const proratedAmount = Math.round((priceDifference / totalDays) * remainingDays)

      // Update subscription immediately
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          planType: 'EXPERT',
          basePrice: 220000,
          finalPrice: subscription.discountPercent > 0
            ? Math.round(220000 * (1 - subscription.discountPercent / 100))
            : 220000
        }
      })

      // Create invoice for prorated amount
      const invoiceNumber = `INV-${Date.now()}`
      await prisma.invoice.create({
        data: {
          subscriptionId,
          stripeInvoiceId: `MANUAL-UPGRADE-${Date.now()}`,
          invoiceNumber,
          amount: proratedAmount,
          status: 'open',
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        }
      })

      // Log the change
      await prisma.activityLog.create({
        data: {
          activityType: 'PLAN_UPGRADED',
          resourceType: 'subscription',
          resourceId: subscriptionId,
          metadata: JSON.stringify({
            fromPlan: 'STANDARD',
            toPlan: 'EXPERT',
            proratedAmount
          }),
          userId
        }
      })

      return res.status(200).json({
        success: true,
        message: `エキスパートコースにアップグレードしました。差額¥${proratedAmount.toLocaleString()}のご請求書を発行しました。`
      })

    } else {
      // Downgrade: Expert -> Standard (次回更新時に反映)
      // Set scheduled plan change
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          scheduledPlanChange: 'STANDARD'
        }
      })

      // Log the change
      await prisma.activityLog.create({
        data: {
          activityType: 'PLAN_DOWNGRADE_SCHEDULED',
          resourceType: 'subscription',
          resourceId: subscriptionId,
          metadata: JSON.stringify({
            fromPlan: 'EXPERT',
            toPlan: 'STANDARD',
            effectiveDate: subscription.currentPeriodEnd
          }),
          userId
        }
      })

      const renewalDate = new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      return res.status(200).json({
        success: true,
        message: `${renewalDate}の更新時にスタンダードコースに変更されます。それまでは引き続きエキスパートコースをご利用いただけます。`
      })
    }

  } catch (error) {
    console.error('Plan change error:', error)
    return res.status(500).json({ error: 'プラン変更に失敗しました' })
  }
}
