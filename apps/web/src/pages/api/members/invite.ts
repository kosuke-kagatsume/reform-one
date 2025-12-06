import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { sendMail, getInvitationEmailHtml, getInvitationEmailText } from '@/lib/mail'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, organizationId, invitedById, role = 'MEMBER', sendEmail = true } = req.body

  if (!email || !organizationId || !invitedById) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          where: { organizationId }
        }
      }
    })

    if (existingUser && existingUser.organizations.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this organization' })
    }

    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId,
        acceptedAt: null,
        expiresAt: { gt: new Date() }
      }
    })

    if (existingInvitation) {
      return res.status(400).json({ error: 'An active invitation already exists for this email' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        organizationId,
        role,
        invitedById,
        expiresAt
      },
      include: {
        organization: true,
        invitedBy: true
      }
    })

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`

    // Send invitation email
    let emailSent = false
    if (sendEmail) {
      const html = getInvitationEmailHtml({
        organizationName: invitation.organization.name,
        inviterName: invitation.invitedBy.name || invitation.invitedBy.email,
        inviteUrl,
        expiresAt: invitation.expiresAt
      })

      const text = getInvitationEmailText({
        organizationName: invitation.organization.name,
        inviterName: invitation.invitedBy.name || invitation.invitedBy.email,
        inviteUrl,
        expiresAt: invitation.expiresAt
      })

      emailSent = await sendMail({
        to: email,
        subject: `【プレミア購読】${invitation.organization.name}への招待`,
        html,
        text
      })
    }

    return res.status(200).json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        organizationName: invitation.organization.name,
        invitedByName: invitation.invitedBy.name
      },
      inviteUrl,
      emailSent
    })
  } catch (error) {
    console.error('Invite error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
