import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Cancel subscription (schedules cancellation at period end)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { subscriptionId, userId, immediate } = req.body

  if (!subscriptionId || !userId) {
    return res.status(400).json({ error: '必須項目が不足しています' })
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { organization: true }
    })

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    if (subscription.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'アクティブな契約ではありません' })
    }

    if (immediate) {
      // Immediate cancellation
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'CANCELLED',
          canceledAt: new Date(),
          autoRenewal: false
        }
      })

      // Log the cancellation
      await prisma.auditLog.create({
        data: {
          userId,
          orgId: subscription.organizationId,
          action: 'subscription.cancelled',
          resource: `subscription:${subscriptionId}`,
          metadata: JSON.stringify({ immediate: true })
        }
      })

      return res.status(200).json({
        success: true,
        message: '契約が解約されました'
      })
    } else {
      // Schedule cancellation at period end
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          cancelAt: subscription.currentPeriodEnd,
          autoRenewal: false
        }
      })

      // Log the scheduled cancellation
      await prisma.auditLog.create({
        data: {
          userId,
          orgId: subscription.organizationId,
          action: 'subscription.cancel_scheduled',
          resource: `subscription:${subscriptionId}`,
          metadata: JSON.stringify({ cancelAt: subscription.currentPeriodEnd })
        }
      })

      return res.status(200).json({
        success: true,
        message: `契約は ${new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP')} に解約されます`,
        cancelAt: subscription.currentPeriodEnd
      })
    }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
