import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { sendMail } from '@/lib/mail'

interface Recipient {
  email: string
  name: string | null
  organizationName: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { memberIds, organizationIds, eventIds, subject, body } = req.body

    if (!subject || !body) {
      return res.status(400).json({ error: '件名と本文は必須です' })
    }

    const recipients: Recipient[] = []
    const seenEmails = new Set<string>()

    // Add individual members
    if (memberIds && memberIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        include: {
          organizations: {
            include: {
              organization: {
                select: { name: true }
              }
            },
            take: 1
          }
        }
      })

      users.forEach(user => {
        if (!seenEmails.has(user.email)) {
          seenEmails.add(user.email)
          recipients.push({
            email: user.email,
            name: user.name,
            organizationName: user.organizations[0]?.organization.name || ''
          })
        }
      })
    }

    // Add members from organizations
    if (organizationIds && organizationIds.length > 0) {
      const userOrgs = await prisma.userOrganization.findMany({
        where: { organizationId: { in: organizationIds } },
        include: {
          user: {
            select: { email: true, name: true }
          },
          organization: {
            select: { name: true }
          }
        }
      })

      userOrgs.forEach(uo => {
        if (!seenEmails.has(uo.user.email)) {
          seenEmails.add(uo.user.email)
          recipients.push({
            email: uo.user.email,
            name: uo.user.name,
            organizationName: uo.organization.name
          })
        }
      })
    }

    // Add participants from events
    if (eventIds && eventIds.length > 0) {
      for (const eventId of eventIds) {
        if (eventId.startsWith('seminar_')) {
          const seminarId = eventId.replace('seminar_', '')
          const participants = await prisma.seminarParticipant.findMany({
            where: { seminarId }
          })

          for (const p of participants) {
            // Get user info
            const user = await prisma.user.findUnique({
              where: { id: p.userId },
              select: { email: true, name: true }
            })
            if (user && !seenEmails.has(user.email)) {
              seenEmails.add(user.email)
              // Get organization name
              const userOrg = await prisma.userOrganization.findFirst({
                where: { userId: p.userId },
                include: { organization: { select: { name: true } } }
              })
              recipients.push({
                email: user.email,
                name: user.name,
                organizationName: userOrg?.organization.name || ''
              })
            }
          }
        } else if (eventId.startsWith('site_visit_')) {
          const siteVisitId = eventId.replace('site_visit_', '')
          const participants = await prisma.siteVisitParticipant.findMany({
            where: { siteVisitId }
          })

          for (const p of participants) {
            const email = p.userEmail
            if (email && !seenEmails.has(email)) {
              seenEmails.add(email)
              recipients.push({
                email,
                name: p.userName,
                organizationName: p.organizationName || ''
              })
            }
          }
        }
      }
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: '送信先がありません' })
    }

    // Send emails
    let sentCount = 0
    let failedCount = 0

    for (const recipient of recipients) {
      try {
        // Replace placeholders
        const personalizedBody = body
          .replace(/\{\{name\}\}/g, recipient.name || 'お客様')
          .replace(/\{\{organization\}\}/g, recipient.organizationName || '')

        const success = await sendMail({
          to: recipient.email,
          subject,
          text: personalizedBody,
          html: personalizedBody.replace(/\n/g, '<br>')
        })

        if (success) {
          sentCount++
        } else {
          failedCount++
        }
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error)
        failedCount++
      }
    }

    return res.status(200).json({
      success: true,
      sentCount,
      failedCount,
      totalRecipients: recipients.length
    })
  } catch (error) {
    console.error('Send mail error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
