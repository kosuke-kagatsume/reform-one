import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10)
  const memberPassword = await bcrypt.hash('User123!', 10)

  const reformCompany = await prisma.organization.upsert({
    where: { slug: 'reform-shinbunsha' },
    update: {},
    create: {
      name: 'リフォーム産業新聞社',
      slug: 'reform-shinbunsha',
      type: 'REFORM_COMPANY'
    }
  })

  const expertOrg = await prisma.organization.upsert({
    where: { slug: 'expert-reform-co' },
    update: {},
    create: {
      name: 'エキスパートリフォーム株式会社',
      slug: 'expert-reform-co',
      type: 'CUSTOMER'
    }
  })

  const standardOrg = await prisma.organization.upsert({
    where: { slug: 'standard-koumuten' },
    update: {},
    create: {
      name: 'スタンダード工務店',
      slug: 'standard-koumuten',
      type: 'CUSTOMER'
    }
  })

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@the-reform.co.jp' },
    update: {},
    create: {
      email: 'admin@the-reform.co.jp',
      name: '管理者',
      userType: 'EMPLOYEE',
      password: hashedPassword,
      emailVerified: true
    }
  })

  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: reformCompany.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: reformCompany.id,
      role: 'ADMIN'
    }
  })

  const expertAdmin = await prisma.user.upsert({
    where: { email: 'admin@expert-reform.co.jp' },
    update: {},
    create: {
      email: 'admin@expert-reform.co.jp',
      name: '山田太郎',
      userType: 'CUSTOMER',
      password: hashedPassword,
      emailVerified: true
    }
  })

  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: expertAdmin.id,
        organizationId: expertOrg.id
      }
    },
    update: {},
    create: {
      userId: expertAdmin.id,
      organizationId: expertOrg.id,
      role: 'ADMIN'
    }
  })

  const expertMember = await prisma.user.upsert({
    where: { email: 'member@expert-reform.co.jp' },
    update: {},
    create: {
      email: 'member@expert-reform.co.jp',
      name: '鈴木花子',
      userType: 'CUSTOMER',
      password: memberPassword,
      emailVerified: true
    }
  })

  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: expertMember.id,
        organizationId: expertOrg.id
      }
    },
    update: {},
    create: {
      userId: expertMember.id,
      organizationId: expertOrg.id,
      role: 'MEMBER'
    }
  })

  const standardAdmin = await prisma.user.upsert({
    where: { email: 'admin@standard-koumuten.jp' },
    update: {},
    create: {
      email: 'admin@standard-koumuten.jp',
      name: '佐藤次郎',
      userType: 'CUSTOMER',
      password: hashedPassword,
      emailVerified: true
    }
  })

  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: standardAdmin.id,
        organizationId: standardOrg.id
      }
    },
    update: {},
    create: {
      userId: standardAdmin.id,
      organizationId: standardOrg.id,
      role: 'ADMIN'
    }
  })

  const now = new Date()
  const oneYearLater = new Date(now)
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

  await prisma.subscription.upsert({
    where: { id: 'expert-sub-1' },
    update: {},
    create: {
      id: 'expert-sub-1',
      organizationId: expertOrg.id,
      planType: 'EXPERT',
      status: 'ACTIVE',
      paymentMethod: 'CARD',
      basePrice: 220000,
      discountPercent: 0,
      discountAmount: 55000,
      finalPrice: 165000,
      autoRenewal: true,
      currentPeriodStart: now,
      currentPeriodEnd: oneYearLater
    }
  })

  await prisma.subscription.upsert({
    where: { id: 'standard-sub-1' },
    update: {},
    create: {
      id: 'standard-sub-1',
      organizationId: standardOrg.id,
      planType: 'STANDARD',
      status: 'ACTIVE',
      paymentMethod: 'BANK_TRANSFER',
      basePrice: 110000,
      discountPercent: 0,
      discountAmount: 55000,
      finalPrice: 55000,
      autoRenewal: false,
      currentPeriodStart: now,
      currentPeriodEnd: oneYearLater
    }
  })

  const salesCategory = await prisma.seminarCategory.upsert({
    where: { slug: 'sales' },
    update: {},
    create: {
      name: '営業セミナー',
      slug: 'sales',
      description: '売れる営業のトリセツセミナー',
      sortOrder: 1
    }
  })

  const standardCategory = await prisma.seminarCategory.upsert({
    where: { slug: 'industry-standard' },
    update: {},
    create: {
      name: '業界標準化研修',
      slug: 'industry-standard',
      description: '経営・建築・現場管理など体系的な講座',
      sortOrder: 2
    }
  })

  const specialistCategory = await prisma.seminarCategory.upsert({
    where: { slug: 'specialist' },
    update: {},
    create: {
      name: 'スペシャリストセミナー',
      slug: 'specialist',
      description: '各分野専門家によるオンライン講座',
      sortOrder: 3
    }
  })

  const propertyCategory = await prisma.seminarCategory.upsert({
    where: { slug: 'property-tour' },
    update: {},
    create: {
      name: 'オンライン物件紹介',
      slug: 'property-tour',
      description: 'リフォーム事例をオンライン配信',
      sortOrder: 4
    }
  })

  const seminarDate1 = new Date()
  seminarDate1.setDate(seminarDate1.getDate() + 7)

  await prisma.seminar.upsert({
    where: { id: 'seminar-1' },
    update: {},
    create: {
      id: 'seminar-1',
      categoryId: salesCategory.id,
      title: '売れる営業のトリセツセミナー 12月回',
      description: '西尾肇氏による月1回の営業スキルアップセミナー。今回は「初回面談で信頼を勝ち取る方法」をテーマにお届けします。',
      instructor: '西尾肇',
      scheduledAt: seminarDate1,
      duration: 90,
      zoomUrl: 'https://zoom.us/j/example1'
    }
  })

  const seminarDate2 = new Date()
  seminarDate2.setDate(seminarDate2.getDate() + 14)

  await prisma.seminar.upsert({
    where: { id: 'seminar-2' },
    update: {},
    create: {
      id: 'seminar-2',
      categoryId: standardCategory.id,
      title: '現場管理の基礎と実践',
      description: '工程管理から品質管理まで、現場管理のポイントを体系的に学びます。',
      instructor: '田中一郎',
      scheduledAt: seminarDate2,
      duration: 120,
      zoomUrl: 'https://zoom.us/j/example2'
    }
  })

  await prisma.archive.upsert({
    where: { id: 'archive-1' },
    update: {},
    create: {
      id: 'archive-1',
      categoryId: salesCategory.id,
      title: '売れる営業のトリセツセミナー 11月回',
      description: '「お客様の本音を引き出す質問術」をテーマにお届けしました。',
      youtubeUrl: 'https://www.youtube.com/watch?v=example1',
      duration: 90,
      publishedAt: new Date('2024-11-15')
    }
  })

  await prisma.archive.upsert({
    where: { id: 'archive-2' },
    update: {},
    create: {
      id: 'archive-2',
      categoryId: specialistCategory.id,
      title: 'リフォーム業界の最新トレンド2024',
      description: '業界の動向と今後の展望について解説しました。',
      youtubeUrl: 'https://www.youtube.com/watch?v=example2',
      duration: 60,
      publishedAt: new Date('2024-11-01')
    }
  })

  const hrCategory = await prisma.communityCategory.upsert({
    where: { slug: 'hr' },
    update: {},
    create: {
      name: '人事',
      slug: 'hr',
      description: '人事・採用・教育に関するコミュニティ',
      meetingUrl: 'https://zoom.us/meeting/register/hr-community',
      sortOrder: 1
    }
  })

  const constructionCategory = await prisma.communityCategory.upsert({
    where: { slug: 'construction' },
    update: {},
    create: {
      name: '施工管理',
      slug: 'construction',
      description: '施工管理・現場監督に関するコミュニティ',
      meetingUrl: 'https://zoom.us/meeting/register/construction-community',
      sortOrder: 2
    }
  })

  await prisma.communityCategory.upsert({
    where: { slug: 'design' },
    update: {},
    create: {
      name: '設計',
      slug: 'design',
      description: '設計・プランニングに関するコミュニティ',
      meetingUrl: 'https://zoom.us/meeting/register/design-community',
      sortOrder: 3
    }
  })

  await prisma.communityCategory.upsert({
    where: { slug: 'pr' },
    update: {},
    create: {
      name: '広報',
      slug: 'pr',
      description: '広報・マーケティングに関するコミュニティ',
      meetingUrl: 'https://zoom.us/meeting/register/pr-community',
      sortOrder: 4
    }
  })

  await prisma.communityPost.upsert({
    where: { id: 'post-1' },
    update: {},
    create: {
      id: 'post-1',
      categoryId: hrCategory.id,
      authorId: adminUser.id,
      title: '12月の人事コミュニティミーティングのお知らせ',
      content: '12月15日（金）15:00より、人事コミュニティの定例ミーティングを開催します。今回のテーマは「2024年新卒採用の振り返りと2025年に向けた戦略」です。ぜひご参加ください。'
    }
  })

  await prisma.communityPost.upsert({
    where: { id: 'post-2' },
    update: {},
    create: {
      id: 'post-2',
      categoryId: constructionCategory.id,
      authorId: adminUser.id,
      title: '施工管理アプリの活用事例共有',
      content: '施工管理アプリを導入されている会員様から活用事例を共有いただきました。特に工程管理と写真管理の効率化について、具体的な運用方法をご紹介いただいています。'
    }
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
