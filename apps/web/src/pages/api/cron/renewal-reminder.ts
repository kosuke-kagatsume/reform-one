import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { sendMail, getRenewalReminderEmailHtml, getRenewalReminderEmailText } from '@/lib/mail'

// Send renewal reminder emails to subscriptions expiring in 30, 14, and 7 days
// This endpoint should be called daily by a cron job
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET for easy cron job setup, POST for manual trigger
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify cron secret for security
  const cronSecret = req.headers['x-cron-secret'] || req.query.secret
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const now = new Date()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Define reminder intervals (days before expiration)
    const reminderDays = [30, 14, 7, 3, 1]
    let totalSent = 0
    const results: Array<{ days: number; sent: number; organizations: string[] }> = []

    for (const days of reminderDays) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + days)

      // Set to start and end of that day
      const dayStart = new Date(targetDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(targetDate)
      dayEnd.setHours(23, 59, 59, 999)

      // Find subscriptions expiring on the target day that haven't been notified yet
      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: dayStart,
            lte: dayEnd,
          },
          // Only notify if not already notified within the last 24 hours
          OR: [
            { renewalNotifiedAt: null },
            { renewalNotifiedAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
          ],
        },
        include: {
          organization: {
            include: {
              users: {
                where: { role: 'ADMIN' },
                include: {
                  user: {
                    select: { email: true, name: true },
                  },
                },
              },
            },
          },
        },
      })

      const sentOrganizations: string[] = []

      for (const subscription of expiringSubscriptions) {
        // Get admin emails
        const adminEmails = subscription.organization.users
          .map((u) => u.user.email)
          .filter((email): email is string => !!email)

        if (adminEmails.length === 0) continue

        // Build email content
        const renewalUrl = `${baseUrl}/dashboard/billing`
        const html = getRenewalReminderEmailHtml({
          organizationName: subscription.organization.name,
          planType: subscription.planType,
          expiresAt: subscription.currentPeriodEnd,
          daysRemaining: days,
          renewalUrl,
        })
        const text = getRenewalReminderEmailText({
          organizationName: subscription.organization.name,
          planType: subscription.planType,
          expiresAt: subscription.currentPeriodEnd,
          daysRemaining: days,
          renewalUrl,
        })

        // Send email
        const success = await sendMail({
          to: adminEmails,
          subject: `【重要】プレミア購読 契約更新のお知らせ（あと${days}日）`,
          html,
          text,
        })

        if (success) {
          // Update notification timestamp
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { renewalNotifiedAt: now },
          })

          totalSent++
          sentOrganizations.push(subscription.organization.name)
        }
      }

      if (sentOrganizations.length > 0) {
        results.push({
          days,
          sent: sentOrganizations.length,
          organizations: sentOrganizations,
        })
      }
    }

    return res.status(200).json({
      success: true,
      totalSent,
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Renewal reminder error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
