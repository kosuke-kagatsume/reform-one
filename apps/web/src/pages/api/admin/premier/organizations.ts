import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const organizations = await prisma.organization.findMany({
        where: { type: 'CUSTOMER' },
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              planType: true,
              status: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              createdAt: true,
              canceledAt: true
            }
          },
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  lastLoginAt: true,
                  status: true
                }
              }
            }
          },
          _count: {
            select: { users: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Transform to expected format with additional data
      const transformedOrgs = organizations.map(org => {
        const subscription = org.subscriptions[0] || null
        const users = org.users.map(u => u.user)

        // Calculate last login across all users
        const lastLogins = users
          .filter(u => u.lastLoginAt)
          .map(u => new Date(u.lastLoginAt!).getTime())
        const lastLoginAt = lastLogins.length > 0
          ? new Date(Math.max(...lastLogins)).toISOString()
          : null

        // Count active users (logged in within 30 days)
        const activeUsers = users.filter(u =>
          u.lastLoginAt && new Date(u.lastLoginAt) >= thirtyDaysAgo
        ).length

        // Calculate days until expiration
        let daysUntilExpiration: number | null = null
        let expirationStatus: 'normal' | 'warning' | 'danger' | 'expired' = 'normal'

        if (subscription?.currentPeriodEnd) {
          const endDate = new Date(subscription.currentPeriodEnd)
          daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntilExpiration < 0) {
            expirationStatus = 'expired'
          } else if (daysUntilExpiration <= 30) {
            expirationStatus = 'danger'
          } else if (daysUntilExpiration <= 60) {
            expirationStatus = 'warning'
          }
        }

        // Determine overall status
        let status: 'active' | 'expiring' | 'expired' | 'canceled' | 'no_subscription' = 'no_subscription'
        if (subscription) {
          if (subscription.status === 'CANCELED') {
            status = 'canceled'
          } else if (subscription.status === 'ACTIVE') {
            if (expirationStatus === 'expired') {
              status = 'expired'
            } else if (expirationStatus === 'danger' || expirationStatus === 'warning') {
              status = 'expiring'
            } else {
              status = 'active'
            }
          }
        }

        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          type: org.type,
          createdAt: org.createdAt,
          isExistingSubscriber: (org as any).isExistingSubscriber ?? false,
          subscription: subscription ? {
            ...subscription,
            daysUntilExpiration,
            expirationStatus
          } : null,
          _count: org._count,
          lastLoginAt,
          activeUsers,
          status
        }
      })

      // Calculate summary stats
      const stats = {
        total: transformedOrgs.length,
        active: transformedOrgs.filter(o => o.status === 'active').length,
        expiring: transformedOrgs.filter(o => o.status === 'expiring').length,
        expired: transformedOrgs.filter(o => o.status === 'expired').length,
        canceled: transformedOrgs.filter(o => o.status === 'canceled').length,
        noSubscription: transformedOrgs.filter(o => o.status === 'no_subscription').length,
        expiring30Days: transformedOrgs.filter(o =>
          o.subscription !== null &&
          o.subscription.daysUntilExpiration !== null &&
          o.subscription.daysUntilExpiration >= 0 &&
          o.subscription.daysUntilExpiration <= 30
        ).length,
        recentlyLoggedIn: transformedOrgs.filter(o => o.activeUsers > 0).length,
        notLoggedIn: transformedOrgs.filter(o => o.activeUsers === 0).length
      }

      return res.status(200).json({
        organizations: transformedOrgs,
        stats
      })
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
