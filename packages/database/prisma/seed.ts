import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10)
  const memberPassword = await bcrypt.hash('User123!', 10)

  // カテゴリ役割マスタ
  const roleRecruitment = await prisma.categoryRole.upsert({
    where: { name: '集客用' },
    update: {},
    create: {
      name: '集客用',
      description: '見込み客獲得のためのセミナー・コンテンツ',
      color: '#3B82F6',
      sortOrder: 1
    }
  })

  const roleTraining = await prisma.categoryRole.upsert({
    where: { name: '研修用' },
    update: {},
    create: {
      name: '研修用',
      description: '社員教育・スキルアップ向けコンテンツ',
      color: '#10B981',
      sortOrder: 2
    }
  })

  const roleArchive = await prisma.categoryRole.upsert({
    where: { name: 'アーカイブ専用' },
    update: {},
    create: {
      name: 'アーカイブ専用',
      description: '過去開催セミナーのアーカイブ配信',
      color: '#8B5CF6',
      sortOrder: 3
    }
  })

  await prisma.categoryRole.upsert({
    where: { name: '特別企画' },
    update: {},
    create: {
      name: '特別企画',
      description: '特別イベント・企画向けカテゴリ',
      color: '#F59E0B',
      sortOrder: 4
    }
  })

  // ツール用途マスタ
  const purposeSurvey = await prisma.toolPurpose.upsert({
    where: { name: '現調用' },
    update: {},
    create: {
      name: '現調用',
      description: '現場調査・診断に使用するツール',
      color: '#3B82F6',
      sortOrder: 1
    }
  })

  const purposeEstimate = await prisma.toolPurpose.upsert({
    where: { name: '見積用' },
    update: {},
    create: {
      name: '見積用',
      description: '見積作成・原価計算に使用するツール',
      color: '#10B981',
      sortOrder: 2
    }
  })

  const purposeContract = await prisma.toolPurpose.upsert({
    where: { name: '契約用' },
    update: {},
    create: {
      name: '契約用',
      description: '契約書類・法務関連ツール',
      color: '#8B5CF6',
      sortOrder: 3
    }
  })

  const purposeSafety = await prisma.toolPurpose.upsert({
    where: { name: '安全管理' },
    update: {},
    create: {
      name: '安全管理',
      description: '安全確認・KY活動に使用するツール',
      color: '#EF4444',
      sortOrder: 4
    }
  })

  const purposeCustomer = await prisma.toolPurpose.upsert({
    where: { name: '顧客満足' },
    update: {},
    create: {
      name: '顧客満足',
      description: '顧客対応・満足度向上に使用するツール',
      color: '#F59E0B',
      sortOrder: 5
    }
  })

  // メールテンプレート
  await prisma.emailTemplate.upsert({
    where: { code: 'FOLLOW_UP' },
    update: {},
    create: {
      code: 'FOLLOW_UP',
      name: 'フォローアップメール',
      description: '未ログイン組織への利用促進メール',
      subject: '【Reform One】サービスのご利用について',
      bodyHtml: `<p>{{organizationName}} 御中</p>
<p>いつもReform Oneをご契約いただきありがとうございます。</p>
<p>ご登録いただいてから、まだサービスをご利用いただいていないようです。</p>
<p>ぜひ以下よりログインして、各種サービスをご活用ください。</p>
<p><a href="{{loginUrl}}">ログインはこちら</a></p>
<p>ご不明点がございましたら、お気軽にお問い合わせください。</p>`,
      bodyText: '{{organizationName}} 御中\n\nいつもReform Oneをご契約いただきありがとうございます。\n\nご登録いただいてから、まだサービスをご利用いただいていないようです。\n\nぜひ以下よりログインして、各種サービスをご活用ください。\n\nログインURL: {{loginUrl}}\n\nご不明点がございましたら、お気軽にお問い合わせください。',
      variables: '["organizationName", "loginUrl", "adminName"]'
    }
  })

  await prisma.emailTemplate.upsert({
    where: { code: 'USAGE_PROMOTION' },
    update: {},
    create: {
      code: 'USAGE_PROMOTION',
      name: '利用促進メール',
      description: '休眠ユーザーへの利用促進メール',
      subject: '【Reform One】最新コンテンツのお知らせ',
      bodyHtml: `<p>{{userName}} 様</p>
<p>いつもReform Oneをご利用いただきありがとうございます。</p>
<p>最近ログインされていないようですが、新しいセミナーやアーカイブが追加されています。</p>
<p>ぜひ最新コンテンツをご確認ください。</p>
<p><a href="{{dashboardUrl}}">ダッシュボードへ</a></p>`,
      bodyText: '{{userName}} 様\n\nいつもReform Oneをご利用いただきありがとうございます。\n\n最近ログインされていないようですが、新しいセミナーやアーカイブが追加されています。\n\nぜひ最新コンテンツをご確認ください。\n\nダッシュボード: {{dashboardUrl}}',
      variables: '["userName", "dashboardUrl", "lastLoginDate"]'
    }
  })

  await prisma.emailTemplate.upsert({
    where: { code: 'RENEWAL_NOTICE' },
    update: {},
    create: {
      code: 'RENEWAL_NOTICE',
      name: '契約更新通知',
      description: '契約更新期限が近い組織への通知',
      subject: '【Reform One】ご契約更新のお知らせ',
      bodyHtml: `<p>{{organizationName}} 御中</p>
<p>いつもReform Oneをご利用いただきありがとうございます。</p>
<p>ご契約の更新期限が{{daysRemaining}}日後（{{expiryDate}}）に迫っております。</p>
<p>引き続きサービスをご利用いただくため、更新手続きをお願いいたします。</p>
<p><a href="{{renewalUrl}}">更新手続きはこちら</a></p>`,
      bodyText: '{{organizationName}} 御中\n\nいつもReform Oneをご利用いただきありがとうございます。\n\nご契約の更新期限が{{daysRemaining}}日後（{{expiryDate}}）に迫っております。\n\n引き続きサービスをご利用いただくため、更新手続きをお願いいたします。\n\n更新手続き: {{renewalUrl}}',
      variables: '["organizationName", "daysRemaining", "expiryDate", "renewalUrl", "planName"]'
    }
  })

  await prisma.emailTemplate.upsert({
    where: { code: 'BULK_FOLLOW_UP' },
    update: {},
    create: {
      code: 'BULK_FOLLOW_UP',
      name: '一斉フォローメール',
      description: '複数組織への一斉送信用フォローメール',
      subject: '【Reform One】サービス活用のご案内',
      bodyHtml: `<p>{{organizationName}} 御中</p>
<p>Reform Oneをご契約いただきありがとうございます。</p>
<p>サービスをより効果的にご活用いただくためのポイントをご紹介します。</p>
<ul>
<li>セミナー：毎月開催の各種セミナーにご参加いただけます</li>
<li>アーカイブ：過去のセミナー動画をいつでも視聴可能</li>
<li>ツール：業務効率化のための各種テンプレートをダウンロード</li>
</ul>
<p><a href="{{loginUrl}}">今すぐログイン</a></p>`,
      bodyText: '{{organizationName}} 御中\n\nReform Oneをご契約いただきありがとうございます。\n\nサービスをより効果的にご活用いただくためのポイントをご紹介します。\n\n・セミナー：毎月開催の各種セミナーにご参加いただけます\n・アーカイブ：過去のセミナー動画をいつでも視聴可能\n・ツール：業務効率化のための各種テンプレートをダウンロード\n\n今すぐログイン: {{loginUrl}}',
      variables: '["organizationName", "loginUrl"]'
    }
  })

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
    update: { roleId: roleRecruitment.id },
    create: {
      name: '営業セミナー',
      slug: 'sales',
      description: '売れる営業のトリセツセミナー',
      roleId: roleRecruitment.id,
      sortOrder: 1
    }
  })

  const standardCategory = await prisma.seminarCategory.upsert({
    where: { slug: 'industry-standard' },
    update: { roleId: roleTraining.id },
    create: {
      name: '業界標準化研修',
      slug: 'industry-standard',
      description: '経営・建築・現場管理など体系的な講座',
      roleId: roleTraining.id,
      sortOrder: 2
    }
  })

  const specialistCategory = await prisma.seminarCategory.upsert({
    where: { slug: 'specialist' },
    update: { roleId: roleArchive.id },
    create: {
      name: 'スペシャリストセミナー',
      slug: 'specialist',
      description: '各分野専門家によるオンライン講座',
      roleId: roleArchive.id,
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

  // Tools seed data
  await prisma.tool.upsert({
    where: { slug: 'estimate-template' },
    update: { purposeId: purposeEstimate.id, fileFormat: 'Excel' },
    create: {
      name: '見積書テンプレート',
      slug: 'estimate-template',
      description: 'リフォーム工事向けの見積書テンプレート（Excel形式）。項目別の単価設定や自動計算機能付き。',
      category: 'テンプレート',
      purposeId: purposeEstimate.id,
      fileUrl: '/downloads/templates/estimate-template.xlsx',
      fileFormat: 'Excel',
      iconName: 'FileSpreadsheet',
      requiredPlan: 'STANDARD',
      sortOrder: 1
    }
  })

  await prisma.tool.upsert({
    where: { slug: 'contract-template' },
    update: { purposeId: purposeContract.id, fileFormat: 'Word' },
    create: {
      name: '契約書テンプレート',
      slug: 'contract-template',
      description: '工事請負契約書のテンプレート（Word形式）。建設業法に準拠した標準書式。',
      category: 'テンプレート',
      purposeId: purposeContract.id,
      fileUrl: '/downloads/templates/contract-template.docx',
      fileFormat: 'Word',
      iconName: 'FileText',
      requiredPlan: 'STANDARD',
      sortOrder: 2
    }
  })

  await prisma.tool.upsert({
    where: { slug: 'cost-calculator' },
    update: { purposeId: purposeEstimate.id, fileFormat: 'Excel' },
    create: {
      name: '原価計算ツール',
      slug: 'cost-calculator',
      description: '工事原価を簡単に計算できるスプレッドシート。材料費・労務費・経費を自動集計。',
      category: '計算ツール',
      purposeId: purposeEstimate.id,
      fileUrl: '/downloads/tools/cost-calculator.xlsx',
      fileFormat: 'Excel',
      iconName: 'Calculator',
      requiredPlan: 'STANDARD',
      sortOrder: 1
    }
  })

  await prisma.tool.upsert({
    where: { slug: 'checklist-inspection' },
    update: { purposeId: purposeSurvey.id, fileFormat: 'PDF' },
    create: {
      name: '現場検査チェックリスト',
      slug: 'checklist-inspection',
      description: '工事完了時の検査項目チェックリスト。部位別・工種別に網羅的にチェック可能。',
      category: 'チェックリスト',
      purposeId: purposeSurvey.id,
      fileUrl: '/downloads/checklists/inspection-checklist.pdf',
      fileFormat: 'PDF',
      iconName: 'ClipboardCheck',
      requiredPlan: 'STANDARD',
      sortOrder: 1
    }
  })

  await prisma.tool.upsert({
    where: { slug: 'diagnosis-sheet' },
    update: { purposeId: purposeSurvey.id, fileFormat: 'PDF' },
    create: {
      name: '住宅診断シート',
      slug: 'diagnosis-sheet',
      description: 'リフォーム提案のための住宅診断シート。現況調査から提案書作成まで一貫して使用可能。',
      category: '診断ツール',
      purposeId: purposeSurvey.id,
      fileUrl: '/downloads/diagnosis/housing-diagnosis.pdf',
      fileFormat: 'PDF',
      iconName: 'ClipboardCheck',
      requiredPlan: 'STANDARD',
      sortOrder: 1
    }
  })

  await prisma.tool.upsert({
    where: { slug: 'project-schedule' },
    update: { fileFormat: 'Excel' },
    create: {
      name: '工程表テンプレート',
      slug: 'project-schedule',
      description: 'ガントチャート形式の工程表テンプレート。複数職種の調整に最適。',
      category: 'テンプレート',
      fileUrl: '/downloads/templates/project-schedule.xlsx',
      fileFormat: 'Excel',
      iconName: 'Calendar',
      requiredPlan: 'STANDARD',
      sortOrder: 3
    }
  })

  await prisma.tool.upsert({
    where: { slug: 'safety-checklist' },
    update: { purposeId: purposeSafety.id, fileFormat: 'PDF' },
    create: {
      name: '安全確認チェックリスト',
      slug: 'safety-checklist',
      description: '現場作業前の安全確認チェックリスト。KY活動記録としても使用可能。',
      category: 'チェックリスト',
      purposeId: purposeSafety.id,
      fileUrl: '/downloads/checklists/safety-checklist.pdf',
      fileFormat: 'PDF',
      iconName: 'Shield',
      requiredPlan: 'STANDARD',
      sortOrder: 2
    }
  })

  await prisma.tool.upsert({
    where: { slug: 'customer-survey' },
    update: { purposeId: purposeCustomer.id, fileFormat: 'Word' },
    create: {
      name: '顧客満足度アンケート',
      slug: 'customer-survey',
      description: '工事完了後の顧客満足度調査テンプレート。改善点の発見に活用。',
      category: 'テンプレート',
      purposeId: purposeCustomer.id,
      fileUrl: '/downloads/templates/customer-survey.docx',
      fileFormat: 'Word',
      iconName: 'Users',
      requiredPlan: 'EXPERT',
      sortOrder: 4
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
