import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const organizations = await prisma.organization.findMany({
        where: { type: 'CUSTOMER' },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
            select: {
              id: true,
              planType: true,
              status: true,
              currentPeriodEnd: true
            }
          },
          _count: {
            select: { users: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Transform to expected format
      const transformedOrgs = organizations.map(org => ({
        ...org,
        subscription: org.subscriptions[0] || null,
        subscriptions: undefined
      }))

      return res.status(200).json({ organizations: transformedOrgs })
    } catch (error) {
      console.error('Get organizations error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { name, slug, planType, adminEmail, adminName, startDate, endDate } = req.body

    if (!name || !slug || !planType || !adminEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      // Check if slug already exists
      const existing = await prisma.organization.findUnique({
        where: { slug }
      })

      if (existing) {
        return res.status(400).json({ error: 'この識別子は既に使用されています' })
      }

      // Create organization
      const organization = await prisma.organization.create({
        data: {
          name,
          slug,
          type: 'CUSTOMER',
          subscriptions: {
            create: {
              planType,
              status: 'ACTIVE',
              paymentMethod: 'BANK_TRANSFER',
              autoRenewal: true,
              basePrice: planType === 'EXPERT' ? 220000 : 110000,
              discountPercent: 25,
              discountAmount: planType === 'EXPERT' ? 55000 : 55000,
              finalPrice: planType === 'EXPERT' ? 165000 : 55000,
              currentPeriodStart: startDate ? new Date(startDate) : new Date(),
              currentPeriodEnd: endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
          }
        },
        include: {
          subscriptions: true
        }
      })

      // Create admin user
      const user = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName || null,
          password: '',
          userType: 'CUSTOMER'
        }
      })

      // Link user to organization
      await prisma.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'ADMIN'
        }
      })

      // Create invitation for admin
      const token = crypto.randomUUID()
      const invitation = await prisma.invitation.create({
        data: {
          email: adminEmail,
          token,
          role: 'ADMIN',
          organizationId: organization.id,
          invitedById: user.id, // Self-invite for initial admin
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      return res.status(201).json({
        organization,
        invitation,
        inviteUrl: `/invite/${invitation.token}`
      })
    } catch (error) {
      console.error('Create organization error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
