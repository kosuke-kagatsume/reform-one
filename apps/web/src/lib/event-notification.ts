// A-3: Event notification utility for automatic email generation
import { prisma } from '@/lib/prisma'
import {
  sendMail,
  getSeminarNotificationEmailHtml,
  getSeminarNotificationEmailText,
  getSiteVisitNotificationEmailHtml,
  getSiteVisitNotificationEmailText,
  getOnlineSiteVisitNotificationEmailHtml,
  getOnlineSiteVisitNotificationEmailText,
} from '@/lib/mail'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://premier.reform-one.jp'

type EventType = 'seminar' | 'site_visit' | 'online_site_visit'

interface BaseEventData {
  id: string
  title: string
  scheduledAt: Date
  description?: string | null
}

interface SeminarEventData extends BaseEventData {
  instructor?: string | null
  zoomUrl?: string | null
  category: { name: string }
}

interface SiteVisitEventData extends BaseEventData {
  companyName?: string | null
  location: string
  capacity?: number | null
}

interface OnlineSiteVisitEventData extends BaseEventData {
  companyName?: string | null
  location?: string | null
  requiredPlan: string
}

/**
 * Get eligible users for event notifications based on plan type
 */
async function getEligibleUsers(requiredPlan: string = 'STANDARD'): Promise<Array<{ email: string; name: string | null }>> {
  // Get all active subscriptions with the required plan or higher
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      ...(requiredPlan === 'EXPERT' ? { planType: 'EXPERT' } : {}),
    },
    select: {
      organizationId: true,
    },
  })

  const orgIds = subscriptions.map((s) => s.organizationId)

  // Get users from those organizations
  const userOrgs = await prisma.userOrganization.findMany({
    where: {
      organizationId: { in: orgIds },
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  // Deduplicate users (in case they belong to multiple orgs)
  const uniqueUsers = new Map<string, { email: string; name: string | null }>()
  for (const uo of userOrgs) {
    if (uo.user.email && !uniqueUsers.has(uo.user.email)) {
      uniqueUsers.set(uo.user.email, { email: uo.user.email, name: uo.user.name })
    }
  }

  return Array.from(uniqueUsers.values())
}

/**
 * Send notification for a seminar event
 */
export async function sendSeminarNotification(seminar: SeminarEventData): Promise<{ sent: number; failed: number }> {
  const users = await getEligibleUsers()
  let sent = 0
  let failed = 0

  for (const user of users) {
    try {
      const html = getSeminarNotificationEmailHtml({
        seminarTitle: seminar.title,
        scheduledAt: seminar.scheduledAt,
        speakerName: seminar.instructor || '未定',
        description: seminar.description || '',
        zoomUrl: seminar.zoomUrl || `${BASE_URL}/dashboard/seminars`,
        category: seminar.category.name,
      })

      const text = getSeminarNotificationEmailText({
        seminarTitle: seminar.title,
        scheduledAt: seminar.scheduledAt,
        speakerName: seminar.instructor || '未定',
        description: seminar.description || '',
        zoomUrl: seminar.zoomUrl || `${BASE_URL}/dashboard/seminars`,
        category: seminar.category.name,
      })

      const success = await sendMail({
        to: user.email,
        subject: `【セミナーのお知らせ】${seminar.title}`,
        html,
        text,
      })

      if (success) sent++
      else failed++
    } catch (error) {
      console.error(`Failed to send seminar notification to ${user.email}:`, error)
      failed++
    }
  }

  // Update notification sent timestamp
  await prisma.seminar.update({
    where: { id: seminar.id },
    data: { notificationSentAt: new Date() },
  })

  console.log(`📧 Seminar notification sent: ${sent} success, ${failed} failed`)
  return { sent, failed }
}

/**
 * Send notification for a site visit event
 */
export async function sendSiteVisitNotification(siteVisit: SiteVisitEventData): Promise<{ sent: number; failed: number }> {
  const users = await getEligibleUsers()
  let sent = 0
  let failed = 0

  const dashboardUrl = `${BASE_URL}/dashboard/site-visits/${siteVisit.id}`

  for (const user of users) {
    try {
      const html = getSiteVisitNotificationEmailHtml({
        title: siteVisit.title,
        companyName: siteVisit.companyName || undefined,
        location: siteVisit.location,
        scheduledAt: siteVisit.scheduledAt,
        description: siteVisit.description || undefined,
        capacity: siteVisit.capacity || undefined,
        dashboardUrl,
      })

      const text = getSiteVisitNotificationEmailText({
        title: siteVisit.title,
        companyName: siteVisit.companyName || undefined,
        location: siteVisit.location,
        scheduledAt: siteVisit.scheduledAt,
        description: siteVisit.description || undefined,
        capacity: siteVisit.capacity || undefined,
        dashboardUrl,
      })

      const success = await sendMail({
        to: user.email,
        subject: `【視察会のお知らせ】${siteVisit.title}`,
        html,
        text,
      })

      if (success) sent++
      else failed++
    } catch (error) {
      console.error(`Failed to send site visit notification to ${user.email}:`, error)
      failed++
    }
  }

  // Update notification sent timestamp
  await prisma.siteVisit.update({
    where: { id: siteVisit.id },
    data: { notificationSentAt: new Date() },
  })

  console.log(`📧 Site visit notification sent: ${sent} success, ${failed} failed`)
  return { sent, failed }
}

/**
 * Send notification for an online site visit event
 */
export async function sendOnlineSiteVisitNotification(onlineSiteVisit: OnlineSiteVisitEventData): Promise<{ sent: number; failed: number }> {
  const users = await getEligibleUsers(onlineSiteVisit.requiredPlan)
  let sent = 0
  let failed = 0

  const dashboardUrl = `${BASE_URL}/dashboard/online-site-visits/${onlineSiteVisit.id}`

  for (const user of users) {
    try {
      const html = getOnlineSiteVisitNotificationEmailHtml({
        title: onlineSiteVisit.title,
        companyName: onlineSiteVisit.companyName || undefined,
        location: onlineSiteVisit.location || undefined,
        scheduledAt: onlineSiteVisit.scheduledAt,
        description: onlineSiteVisit.description || undefined,
        dashboardUrl,
      })

      const text = getOnlineSiteVisitNotificationEmailText({
        title: onlineSiteVisit.title,
        companyName: onlineSiteVisit.companyName || undefined,
        location: onlineSiteVisit.location || undefined,
        scheduledAt: onlineSiteVisit.scheduledAt,
        description: onlineSiteVisit.description || undefined,
        dashboardUrl,
      })

      const success = await sendMail({
        to: user.email,
        subject: `【オンライン見学会のお知らせ】${onlineSiteVisit.title}`,
        html,
        text,
      })

      if (success) sent++
      else failed++
    } catch (error) {
      console.error(`Failed to send online site visit notification to ${user.email}:`, error)
      failed++
    }
  }

  // Update notification sent timestamp
  await prisma.onlineSiteVisit.update({
    where: { id: onlineSiteVisit.id },
    data: { notificationSentAt: new Date() },
  })

  console.log(`📧 Online site visit notification sent: ${sent} success, ${failed} failed`)
  return { sent, failed }
}

/**
 * Check if event notification should be sent
 * Returns true if:
 * - Event is published
 * - Notification has not been sent yet
 */
export function shouldSendNotification(isPublished: boolean, notificationSentAt: Date | null): boolean {
  return isPublished && !notificationSentAt
}
