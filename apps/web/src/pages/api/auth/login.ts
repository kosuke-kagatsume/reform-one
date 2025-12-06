import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                subscriptions: {
                  where: { status: 'ACTIVE' },
                  take: 1
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Please use magic link to login' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const userOrg = user.organizations[0]
    if (!userOrg) {
      return res.status(401).json({ error: 'User has no organization' })
    }

    const subscription = userOrg.organization.subscriptions[0] || null

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      organization: {
        id: userOrg.organization.id,
        name: userOrg.organization.name,
        slug: userOrg.organization.slug,
        type: userOrg.organization.type,
        createdAt: userOrg.organization.createdAt,
        updatedAt: userOrg.organization.updatedAt
      },
      role: userOrg.role,
      subscription: subscription ? {
        id: subscription.id,
        organizationId: subscription.organizationId,
        planType: subscription.planType,
        status: subscription.status,
        paymentMethod: subscription.paymentMethod,
        basePrice: subscription.basePrice,
        discountPercent: subscription.discountPercent,
        discountAmount: subscription.discountAmount,
        finalPrice: subscription.finalPrice,
        autoRenewal: subscription.autoRenewal,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAt: subscription.cancelAt,
        canceledAt: subscription.canceledAt
      } : null
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        orgId: userOrg.organization.id,
        action: 'user.login',
        ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    })

    return res.status(200).json({ user: responseUser })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
