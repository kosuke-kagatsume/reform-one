import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import {
  sendMail,
  getAdminContactEmailHtml,
  getAdminContactEmailText,
  getAdminRenewalNoticeEmailHtml,
  getAdminRenewalNoticeEmailText
} from '@/lib/mail'

type EmailType = 'CONTACT' | 'RENEWAL_NOTICE'

interface SendEmailRequest {
  type: EmailType
  recipientId: string // User ID or Organization ID depending on recipientType
  recipientType: 'USER' | 'ORGANIZATION'
  subject: string
  message?: string
  // For renewal notice
  contactInfo?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // TODO: Add proper admin authentication check
  // For now, we'll proceed with the request

  const { type, recipientId, recipientType, subject, message, contactInfo } = req.body as SendEmailRequest

  if (!type || !recipientId || !recipientType || !subject) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    let recipients: { email: string; name: string | null; userId: string }[] = []
    let organizationName = ''
    let organizationId = ''
    let planType = ''
    let expiresAt: Date | null = null
    let daysRemaining = 0

    if (recipientType === 'ORGANIZATION') {
      // Get organization and all its users
      const organization = await prisma.organization.findUnique({
        where: { id: recipientId },
        include: {
          users: {
            include: {
              user: {
                select: { id: true, email: true, name: true }
              }
            }
          },
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              planType: true,
              currentPeriodEnd: true
            }
          }
        }
      })

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' })
      }

      organizationName = organization.name
      organizationId = organization.id
      recipients = organization.users.map(u => ({
        email: u.user.email,
        name: u.user.name,
        userId: u.user.id
      }))

      if (organization.subscriptions[0]) {
        planType = organization.subscriptions[0].planType
        expiresAt = organization.subscriptions[0].currentPeriodEnd
        if (expiresAt) {
          daysRemaining = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }
      }
    } else {
      // Get single user
      const user = await prisma.user.findUnique({
        where: { id: recipientId },
        include: {
          organizations: {
            include: {
              organization: {
                include: {
                  subscriptions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                      planType: true,
                      currentPeriodEnd: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      recipients = [{ email: user.email, name: user.name, userId: user.id }]

      const userOrg = user.organizations[0]
      if (userOrg) {
        organizationName = userOrg.organization.name
        organizationId = userOrg.organization.id
        if (userOrg.organization.subscriptions[0]) {
          planType = userOrg.organization.subscriptions[0].planType
          expiresAt = userOrg.organization.subscriptions[0].currentPeriodEnd
          if (expiresAt) {
            daysRemaining = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          }
        }
      }
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found' })
    }

    // TODO: Get actual admin user from session
    const senderName = 'プレミア購読運営事務局'
    const sentById = 'admin' // Should be actual admin user ID from session

    let emailsSent = 0
    let emailsFailed = 0

    for (const recipient of recipients) {
      let html: string
      let text: string

      if (type === 'CONTACT') {
        html = getAdminContactEmailHtml({
          recipientName: recipient.name || '会員',
          organizationName,
          subject,
          message: message || '',
          senderName
        })
        text = getAdminContactEmailText({
          recipientName: recipient.name || '会員',
          organizationName,
          subject,
          message: message || '',
          senderName
        })
      } else if (type === 'RENEWAL_NOTICE') {
        if (!expiresAt) {
          continue // Skip if no subscription
        }
        html = getAdminRenewalNoticeEmailHtml({
          organizationName,
          recipientName: recipient.name || '会員',
          planType,
          expiresAt,
          daysRemaining,
          contactInfo: contactInfo || '更新手続きについては、このメールに返信してお問い合わせください。'
        })
        text = getAdminRenewalNoticeEmailText({
          organizationName,
          recipientName: recipient.name || '会員',
          planType,
          expiresAt,
          daysRemaining,
          contactInfo: contactInfo || '更新手続きについては、このメールに返信してお問い合わせください。'
        })
      } else {
        return res.status(400).json({ error: 'Invalid email type' })
      }

      const success = await sendMail({
        to: recipient.email,
        subject,
        html,
        text
      })

      // Save email history
      try {
        await prisma.emailHistory.create({
          data: {
            templateType: type,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            recipientType,
            recipientId: recipientType === 'ORGANIZATION' ? organizationId : recipient.userId,
            subject,
            body: text,
            status: success ? 'SENT' : 'FAILED',
            sentById,
            metadata: JSON.stringify({
              organizationId,
              organizationName,
              planType,
              daysRemaining: type === 'RENEWAL_NOTICE' ? daysRemaining : undefined
            })
          }
        })
      } catch (historyError) {
        console.error('Failed to save email history:', historyError)
      }

      if (success) {
        emailsSent++
      } else {
        emailsFailed++
      }
    }

    return res.status(200).json({
      success: true,
      emailsSent,
      emailsFailed,
      totalRecipients: recipients.length
    })
  } catch (error) {
    console.error('Send email error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
