import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { sendMail, getSeminarNotificationEmailHtml, getSeminarNotificationEmailText } from '@/lib/mail'

// Send seminar notification to all active subscription users
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { seminarId } = req.body

  if (!seminarId) {
    return res.status(400).json({ error: 'Missing seminar ID' })
  }

  try {
    // Get seminar details
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: {
        category: true
      }
    })

    if (!seminar) {
      return res.status(404).json({ error: 'Seminar not found' })
    }

    // Get all active subscriptions and their organization members
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        organization: {
          include: {
            users: {
              include: {
                user: {
                  select: {
                    email: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Collect all user emails
    const userEmails: string[] = []
    for (const subscription of activeSubscriptions) {
      for (const userOrg of subscription.organization.users) {
        if (userOrg.user.email) {
          userEmails.push(userOrg.user.email)
        }
      }
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(userEmails)]

    if (uniqueEmails.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No users to notify' })
    }

    // Build email content
    const html = getSeminarNotificationEmailHtml({
      seminarTitle: seminar.title,
      scheduledAt: seminar.scheduledAt,
      speakerName: seminar.instructor || '未定',
      description: seminar.description || '',
      zoomUrl: seminar.zoomUrl || '',
      category: seminar.category?.name || 'セミナー'
    })

    const text = getSeminarNotificationEmailText({
      seminarTitle: seminar.title,
      scheduledAt: seminar.scheduledAt,
      speakerName: seminar.instructor || '未定',
      description: seminar.description || '',
      zoomUrl: seminar.zoomUrl || '',
      category: seminar.category?.name || 'セミナー'
    })

    // Send emails in batches to avoid overwhelming the mail server
    const batchSize = 50
    let sentCount = 0

    for (let i = 0; i < uniqueEmails.length; i += batchSize) {
      const batch = uniqueEmails.slice(i, i + batchSize)
      const success = await sendMail({
        to: batch,
        subject: `【セミナー】${seminar.title}のお知らせ`,
        text,
        html
      })
      if (success) {
        sentCount += batch.length
      }
    }

    // Update seminar to mark notification as sent
    await prisma.seminar.update({
      where: { id: seminarId },
      data: {
        notificationSentAt: new Date()
      }
    })

    return res.status(200).json({
      sent: sentCount,
      total: uniqueEmails.length,
      seminarTitle: seminar.title
    })
  } catch (error) {
    console.error('Seminar notification error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
