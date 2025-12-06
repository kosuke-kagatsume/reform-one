import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

interface ImportOrganization {
  name: string
  slug?: string
  planType: 'STANDARD' | 'EXPERT'
  adminEmail: string
  adminName?: string
  adminPassword?: string
  members?: Array<{
    email: string
    name?: string
  }>
  subscriptionStart?: string
  subscriptionEnd?: string
}

// Admin-only: Import organizations from CSV/JSON
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { organizations, dryRun } = req.body as {
      organizations: ImportOrganization[]
      dryRun?: boolean
    }

    if (!organizations || !Array.isArray(organizations)) {
      return res.status(400).json({ error: 'Organizations array is required' })
    }

    const results: Array<{
      name: string
      status: 'success' | 'error' | 'skipped'
      message?: string
      organizationId?: string
    }> = []

    for (const org of organizations) {
      try {
        // Validate required fields
        if (!org.name || !org.adminEmail || !org.planType) {
          results.push({
            name: org.name || 'Unknown',
            status: 'error',
            message: 'Missing required fields: name, adminEmail, or planType',
          })
          continue
        }

        // Check if organization already exists
        const existingOrg = await prisma.organization.findFirst({
          where: {
            OR: [
              { name: org.name },
              { slug: org.slug || org.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
            ],
          },
        })

        if (existingOrg) {
          results.push({
            name: org.name,
            status: 'skipped',
            message: 'Organization already exists',
            organizationId: existingOrg.id,
          })
          continue
        }

        // Check if admin user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: org.adminEmail },
        })

        if (existingUser) {
          results.push({
            name: org.name,
            status: 'error',
            message: `Admin email ${org.adminEmail} already exists`,
          })
          continue
        }

        if (dryRun) {
          results.push({
            name: org.name,
            status: 'success',
            message: 'Dry run - would be created',
          })
          continue
        }

        // Create organization
        const slug = org.slug || org.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const organization = await prisma.organization.create({
          data: {
            name: org.name,
            slug,
            type: 'CUSTOMER',
          },
        })

        // Create admin user
        const password = org.adminPassword || 'Reform2025!'
        const hashedPassword = await bcrypt.hash(password, 10)

        const adminUser = await prisma.user.create({
          data: {
            email: org.adminEmail,
            name: org.adminName || org.name + ' 管理者',
            password: hashedPassword,
            userType: 'CUSTOMER',
            emailVerified: true,
          },
        })

        // Link admin to organization
        await prisma.userOrganization.create({
          data: {
            userId: adminUser.id,
            organizationId: organization.id,
            role: 'ADMIN',
          },
        })

        // Create subscription
        const now = new Date()
        const startDate = org.subscriptionStart ? new Date(org.subscriptionStart) : now
        const endDate = org.subscriptionEnd
          ? new Date(org.subscriptionEnd)
          : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

        const basePrice = org.planType === 'EXPERT' ? 220000 : 110000

        const subscription = await prisma.subscription.create({
          data: {
            organizationId: organization.id,
            planType: org.planType,
            status: 'ACTIVE',
            paymentMethod: 'BANK_TRANSFER',
            basePrice,
            discountPercent: 0,
            discountAmount: 0,
            finalPrice: basePrice,
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
            autoRenewal: true,
          },
        })

        // Create entitlements
        const entitlements =
          org.planType === 'EXPERT'
            ? ['seminar', 'archive', 'community', 'databook', 'newsletter']
            : ['seminar', 'archive']

        for (const feature of entitlements) {
          await prisma.entitlement.create({
            data: {
              subscriptionId: subscription.id,
              feature,
            },
          })
        }

        // Create member users if provided
        if (org.members && Array.isArray(org.members)) {
          for (const member of org.members) {
            const memberPassword = await bcrypt.hash('Reform2025!', 10)
            const memberUser = await prisma.user.create({
              data: {
                email: member.email,
                name: member.name || member.email.split('@')[0],
                password: memberPassword,
                userType: 'CUSTOMER',
                emailVerified: true,
              },
            })

            await prisma.userOrganization.create({
              data: {
                userId: memberUser.id,
                organizationId: organization.id,
                role: 'MEMBER',
              },
            })
          }
        }

        results.push({
          name: org.name,
          status: 'success',
          message: `Created with ${(org.members?.length || 0) + 1} users`,
          organizationId: organization.id,
        })
      } catch (error) {
        console.error(`Error importing ${org.name}:`, error)
        results.push({
          name: org.name || 'Unknown',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const summary = {
      total: organizations.length,
      success: results.filter((r) => r.status === 'success').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      errors: results.filter((r) => r.status === 'error').length,
    }

    return res.status(200).json({
      summary,
      results,
      dryRun: dryRun || false,
    })
  } catch (error) {
    console.error('Import organizations error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
