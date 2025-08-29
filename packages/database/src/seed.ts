import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.session.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.addon.deleteMany()
  await prisma.entitlement.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.userOrganization.deleteMany()
  await prisma.organizationSettings.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  console.log('✨ Cleaned existing data')

  // Create test organizations
  const testOrg = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org',
      domainRestriction: JSON.stringify(['test-org.com']),
      settings: {
        create: {
          enforceMfa: false,
          seatLimit: 50,
          allowedDomains: JSON.stringify(['test-org.com']),
        },
      },
    },
  })

  const demoOrg = await prisma.organization.create({
    data: {
      name: 'Demo Company',
      slug: 'demo-company',
      domainRestriction: JSON.stringify([]),
      settings: {
        create: {
          enforceMfa: false,
          seatLimit: null, // Unlimited
          allowedDomains: JSON.stringify([]),
        },
      },
    },
  })

  console.log('✅ Created organizations')

  // Create test users
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const userPassword = await bcrypt.hash('User123!', 12)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test-org.com',
      name: 'Admin User',
      password: adminPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: testOrg.id,
          role: 'ADMIN',
        },
      },
    },
  })

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@test-org.com',
      name: 'Manager User',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: testOrg.id,
          role: 'DEPARTMENT_MANAGER',
          departmentId: 'dept_sales',
        },
      },
    },
  })

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@test-org.com',
      name: 'Member User',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: testOrg.id,
          role: 'MEMBER',
        },
      },
    },
  })

  const demoAdmin = await prisma.user.create({
    data: {
      email: 'demo@demo-company.com',
      name: 'Demo Admin',
      password: adminPassword,
      emailVerified: true,
      mfaEnabled: true,
      mfaSecret: 'JBSWY3DPEHPK3PXP', // Example secret for testing
      organizations: {
        create: {
          organizationId: demoOrg.id,
          role: 'ADMIN',
        },
      },
    },
  })

  console.log('✅ Created users')

  // Create subscriptions
  const testSubscription = await prisma.subscription.create({
    data: {
      organizationId: testOrg.id,
      planType: 'PREMIUM_10M',
      status: 'ACTIVE',
      stripeCustomerId: 'cus_test_123',
      stripeSubscriptionId: 'sub_test_123',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      entitlements: {
        create: [
          { feature: 'e-paper', limit: null },
          { feature: 'articles', limit: null },
          { feature: 'videos', limit: 100 },
          { feature: 'newsletter', limit: null },
          { feature: 'community', limit: null },
        ],
      },
    },
  })

  const demoSubscription = await prisma.subscription.create({
    data: {
      organizationId: demoOrg.id,
      planType: 'PREMIUM_20M',
      status: 'ACTIVE',
      stripeCustomerId: 'cus_demo_123',
      stripeSubscriptionId: 'sub_demo_123',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      entitlements: {
        create: [
          { feature: 'e-paper', limit: null },
          { feature: 'articles', limit: null },
          { feature: 'videos', limit: null },
          { feature: 'newsletter', limit: null },
          { feature: 'community', limit: null },
          { feature: 'databook', limit: null },
          { feature: 'advanced-analytics', limit: null },
        ],
      },
      addons: {
        create: [
          { type: 'paper', quantity: 2, pricePerUnit: 20000 },
          { type: 'electronic_id', quantity: 5, pricePerUnit: 1500 },
        ],
      },
    },
  })

  console.log('✅ Created subscriptions')

  // Create pending invitations
  await prisma.invitation.createMany({
    data: [
      {
        email: 'pending1@test-org.com',
        token: 'invite_token_1',
        organizationId: testOrg.id,
        role: 'MEMBER',
        invitedById: adminUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        email: 'pending2@test-org.com',
        token: 'invite_token_2',
        organizationId: testOrg.id,
        role: 'DEPARTMENT_MANAGER',
        invitedById: adminUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    ],
  })

  console.log('✅ Created invitations')

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        orgId: testOrg.id,
        action: 'user.signup',
        resource: `user:${adminUser.id}`,
        metadata: JSON.stringify({ email: adminUser.email }),
      },
      {
        userId: adminUser.id,
        orgId: testOrg.id,
        action: 'organization.created',
        resource: `organization:${testOrg.id}`,
        metadata: JSON.stringify({ name: testOrg.name }),
      },
      {
        userId: adminUser.id,
        orgId: testOrg.id,
        action: 'subscription.created',
        resource: `subscription:${testSubscription.id}`,
        metadata: JSON.stringify({ planType: 'PREMIUM_10M' }),
      },
    ],
  })

  console.log('✅ Created audit logs')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\nTest accounts:')
  console.log('  Admin:   admin@test-org.com / Admin123!')
  console.log('  Manager: manager@test-org.com / User123!')
  console.log('  Member:  member@test-org.com / User123!')
  console.log('  Demo:    demo@demo-company.com / Admin123! (MFA enabled)')
  console.log('\nTest invitation tokens:')
  console.log('  invite_token_1 (Member role)')
  console.log('  invite_token_2 (Department Manager role)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })