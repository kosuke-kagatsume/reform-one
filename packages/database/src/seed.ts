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
  await prisma.department.deleteMany()
  await prisma.organizationSettings.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  console.log('✨ Cleaned existing data')

  // Create Reform Company (internal organization)
  const reformCompany = await prisma.organization.create({
    data: {
      name: 'リフォーム産業新聞社',
      slug: 'reform-company',
      type: 'REFORM_COMPANY',
      domainRestriction: JSON.stringify(['reform-s.co.jp']),
      settings: {
        create: {
          enforceMfa: true,
          seatLimit: null,
          allowedDomains: JSON.stringify(['reform-s.co.jp']),
        },
      },
      departments: {
        create: [
          {
            name: '企画開発部',
            code: 'PLANNING',
            permissions: JSON.stringify(['crm.manage', 'content.manage', 'analytics.view']),
          },
          {
            name: '編集部',
            code: 'EDITORIAL',
            permissions: JSON.stringify(['content.manage', 'analytics.view']),
          },
          {
            name: '管理部',
            code: 'MANAGEMENT',
            permissions: JSON.stringify(['crm.manage', 'billing.manage', 'analytics.view']),
          },
        ],
      },
    },
    include: {
      departments: true,
    },
  })

  // Create customer organizations
  const heavyCustomer = await prisma.organization.create({
    data: {
      name: '株式会社大手リフォーム',
      slug: 'ohte-reform',
      type: 'CUSTOMER',
      domainRestriction: JSON.stringify(['ohte-reform.co.jp']),
      settings: {
        create: {
          enforceMfa: false,
          seatLimit: 50,
          allowedDomains: JSON.stringify(['ohte-reform.co.jp']),
        },
      },
    },
  })

  const lightCustomer = await prisma.organization.create({
    data: {
      name: '田中工務店',
      slug: 'tanaka-koumuten',
      type: 'CUSTOMER',
      domainRestriction: JSON.stringify([]),
      settings: {
        create: {
          enforceMfa: false,
          seatLimit: 5,
          allowedDomains: JSON.stringify([]),
        },
      },
    },
  })

  console.log('✅ Created organizations')

  // Create passwords
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const userPassword = await bcrypt.hash('User123!', 12)

  // Create Reform Company employees
  const planningDept = reformCompany.departments.find(d => d.code === 'PLANNING')!
  const editorialDept = reformCompany.departments.find(d => d.code === 'EDITORIAL')!
  const managementDept = reformCompany.departments.find(d => d.code === 'MANAGEMENT')!

  const reformAdmin = await prisma.user.create({
    data: {
      email: 'admin@reform-s.co.jp',
      name: '管理者',
      userType: 'EMPLOYEE',
      password: adminPassword,
      emailVerified: true,
      mfaEnabled: true,
      mfaSecret: 'JBSWY3DPEHPK3PXP',
      organizations: {
        create: {
          organizationId: reformCompany.id,
          role: 'ADMIN',
          departmentId: managementDept.id,
        },
      },
    },
  })

  const planningManager = await prisma.user.create({
    data: {
      email: 'planning@reform-s.co.jp',
      name: '企画部長',
      userType: 'EMPLOYEE',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: reformCompany.id,
          role: 'DEPARTMENT_MANAGER',
          departmentId: planningDept.id,
        },
      },
    },
  })

  const editorialStaff = await prisma.user.create({
    data: {
      email: 'editor@reform-s.co.jp',
      name: '編集スタッフ',
      userType: 'EMPLOYEE',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: reformCompany.id,
          role: 'MEMBER',
          departmentId: editorialDept.id,
        },
      },
    },
  })

  // Create heavy customer users (研修・オンラインサロン参加企業)
  const heavyCustomerAdmin = await prisma.user.create({
    data: {
      email: 'admin@ohte-reform.co.jp',
      name: '大手リフォーム管理者',
      userType: 'CUSTOMER',
      password: adminPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: heavyCustomer.id,
          role: 'ADMIN',
        },
      },
    },
  })

  const heavyCustomerUser = await prisma.user.create({
    data: {
      email: 'user@ohte-reform.co.jp',
      name: '大手リフォーム社員',
      userType: 'CUSTOMER',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: heavyCustomer.id,
          role: 'MEMBER',
        },
      },
    },
  })

  // Create light customer users (電子版購読のみ)
  const lightCustomerOwner = await prisma.user.create({
    data: {
      email: 'tanaka@tanaka-koumuten.jp',
      name: '田中太郎',
      userType: 'CUSTOMER',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: lightCustomer.id,
          role: 'ADMIN',
        },
      },
    },
  })

  // Create external instructor
  const externalInstructor = await prisma.user.create({
    data: {
      email: 'instructor@external.com',
      name: '外部講師',
      userType: 'EXTERNAL_INSTRUCTOR',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
    },
  })

  // Create demo accounts for easy testing
  const demoAdmin = await prisma.user.create({
    data: {
      email: 'admin@test-org.com',
      name: 'デモ管理者',
      userType: 'CUSTOMER',
      password: adminPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: heavyCustomer.id,
          role: 'ADMIN',
        },
      },
    },
  })

  const demoManager = await prisma.user.create({
    data: {
      email: 'manager@test-org.com',
      name: 'デモマネージャー',
      userType: 'CUSTOMER',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: heavyCustomer.id,
          role: 'DEPARTMENT_MANAGER',
        },
      },
    },
  })

  const demoMember = await prisma.user.create({
    data: {
      email: 'member@test-org.com',
      name: 'デモメンバー',
      userType: 'CUSTOMER',
      password: userPassword,
      emailVerified: true,
      mfaEnabled: false,
      organizations: {
        create: {
          organizationId: heavyCustomer.id,
          role: 'MEMBER',
        },
      },
    },
  })

  console.log('✅ Created users')

  // Create subscriptions with flexible pricing
  const heavySubscription = await prisma.subscription.create({
    data: {
      organizationId: heavyCustomer.id,
      planType: 'ENTERPRISE',
      status: 'ACTIVE',
      basePrice: 200000,
      discountPercent: 10,
      discountAmount: 20000,
      finalPrice: 180000,
      userLimit: null,
      stripeCustomerId: 'cus_heavy_123',
      stripeSubscriptionId: 'sub_heavy_123',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      entitlements: {
        create: [
          { feature: 'e-paper', limit: null },
          { feature: 'articles', limit: null },
          { feature: 'videos', limit: null },
          { feature: 'newsletter', limit: null },
          { feature: 'community', limit: null },
          { feature: 'training', limit: null },
          { feature: 'online-salon', limit: null },
          { feature: 'materials-catalog', limit: null },
          { feature: 'advanced-analytics', limit: null },
        ],
      },
      addons: {
        create: [
          { type: 'paper', quantity: 5, pricePerUnit: 20000 },
          { type: 'electronic_id', quantity: 10, pricePerUnit: 1500 },
        ],
      },
    },
  })

  const lightSubscription = await prisma.subscription.create({
    data: {
      organizationId: lightCustomer.id,
      planType: 'STARTER',
      status: 'ACTIVE',
      basePrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      finalPrice: 0,
      userLimit: 5,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      entitlements: {
        create: [
          { feature: 'e-paper', limit: 10 },
          { feature: 'articles', limit: 50 },
          { feature: 'newsletter', limit: null },
        ],
      },
    },
  })

  console.log('✅ Created subscriptions')

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: reformAdmin.id,
        orgId: reformCompany.id,
        action: 'user.login',
        resource: `user:${reformAdmin.id}`,
        metadata: JSON.stringify({ email: reformAdmin.email }),
      },
      {
        userId: heavyCustomerAdmin.id,
        orgId: heavyCustomer.id,
        action: 'subscription.created',
        resource: `subscription:${heavySubscription.id}`,
        metadata: JSON.stringify({ planType: 'ENTERPRISE', finalPrice: 180000 }),
      },
      {
        userId: lightCustomerOwner.id,
        orgId: lightCustomer.id,
        action: 'user.signup',
        resource: `user:${lightCustomerOwner.id}`,
        metadata: JSON.stringify({ email: lightCustomerOwner.email }),
      },
    ],
  })

  console.log('✅ Created audit logs')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n=== リフォーム産業新聞社 社員アカウント ===')
  console.log('  管理者:     admin@reform-s.co.jp / Admin123! (MFA有効)')
  console.log('  企画部長:   planning@reform-s.co.jp / User123!')
  console.log('  編集スタッフ: editor@reform-s.co.jp / User123!')
  console.log('\n=== 顧客企業アカウント (ヘビーユーザー) ===')
  console.log('  大手リフォーム管理者: admin@ohte-reform.co.jp / Admin123!')
  console.log('  大手リフォーム社員:   user@ohte-reform.co.jp / User123!')
  console.log('\n=== 顧客企業アカウント (ライトユーザー) ===')
  console.log('  田中工務店:          tanaka@tanaka-koumuten.jp / User123!')
  console.log('\n=== デモアカウント (素早くテスト用) ===')
  console.log('  管理者:     admin@test-org.com / Admin123!')
  console.log('  マネージャー: manager@test-org.com / User123!')
  console.log('  メンバー:    member@test-org.com / User123!')
  console.log('\n=== 外部講師 ===')
  console.log('  講師:       instructor@external.com / User123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })