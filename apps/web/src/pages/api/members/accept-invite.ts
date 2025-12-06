import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, name, password } = req.body

  if (!token || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true }
    })

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' })
    }

    if (invitation.acceptedAt) {
      return res.status(400).json({ error: 'Invitation has already been accepted' })
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invitation has expired' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let user = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (user) {
      await prisma.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role
        }
      })
    } else {
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          name,
          password: hashedPassword,
          userType: 'CUSTOMER',
          emailVerified: true,
          organizations: {
            create: {
              organizationId: invitation.organizationId,
              role: invitation.role
            }
          }
        }
      })
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() }
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        orgId: invitation.organizationId,
        action: 'member.joined',
        metadata: JSON.stringify({ invitationId: invitation.id })
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Successfully joined the organization'
    })
  } catch (error) {
    console.error('Accept invite error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
