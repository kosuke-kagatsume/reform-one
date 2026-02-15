export type PlanType = 'STANDARD' | 'EXPERT'

export type DiscountType = 'NONE' | 'EXISTING_SUBSCRIBER' | 'EXHIBITION' | 'EXHIBITION_EXISTING'

export type ExistingSubscriptionType = 'PAPER' | 'ANNUAL_DIGITAL' | 'MONTHLY_DIGITAL'

export const EXISTING_SUBSCRIPTION_OPTIONS: { value: ExistingSubscriptionType; label: string }[] = [
  { value: 'PAPER', label: '既存購読（紙）' },
  { value: 'ANNUAL_DIGITAL', label: '既存購読（年間電子版）' },
  { value: 'MONTHLY_DIGITAL', label: '既存購読（月額電子版）' },
]

export function calculatePrice(planType: PlanType, discountType: DiscountType): { basePrice: number; finalPrice: number; discountPercent: number; discountAmount: number } {
  const basePrice = planType === 'EXPERT' ? 220000 : 110000
  let price = basePrice
  let discountPercent = 0
  let discountAmount = 0

  if (discountType === 'EXHIBITION' || discountType === 'EXHIBITION_EXISTING') {
    discountPercent = 20
    price = Math.round(basePrice * 0.8)
  }

  if (discountType === 'EXISTING_SUBSCRIBER' || discountType === 'EXHIBITION_EXISTING') {
    discountAmount = 22000
    price = price - 22000
  }

  return { basePrice, finalPrice: price, discountPercent, discountAmount }
}

export interface PlanOption {
  planType: PlanType
  discountType: DiscountType
  label: string
  price: number
}

export const PLAN_OPTIONS: PlanOption[] = [
  { planType: 'STANDARD', discountType: 'NONE', label: 'スタンダード', price: 110000 },
  { planType: 'EXPERT', discountType: 'NONE', label: 'エキスパート', price: 220000 },
  { planType: 'STANDARD', discountType: 'EXISTING_SUBSCRIBER', label: 'スタンダード（既存購読者）', price: 88000 },
  { planType: 'EXPERT', discountType: 'EXISTING_SUBSCRIBER', label: 'エキスパート（既存購読者）', price: 198000 },
  { planType: 'STANDARD', discountType: 'EXHIBITION', label: 'スタンダード20%引き（展示会割引）', price: 88000 },
  { planType: 'EXPERT', discountType: 'EXHIBITION', label: 'エキスパート20%引き（展示会割引）', price: 176000 },
  { planType: 'STANDARD', discountType: 'EXHIBITION_EXISTING', label: 'スタンダード20%引き（既存購読者）', price: 66000 },
  { planType: 'EXPERT', discountType: 'EXHIBITION_EXISTING', label: 'エキスパート20%引き（既存購読者）', price: 154000 },
]

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  NONE: 'なし',
  EXISTING_SUBSCRIBER: '既存購読者割引',
  EXHIBITION: '展示会割引',
  EXHIBITION_EXISTING: '展示会割引＋既存購読者',
}

export type AdminPermissionLevel = 'VIEW' | 'EDIT' | 'FULL'

export const ADMIN_PERMISSION_LABELS: Record<AdminPermissionLevel, string> = {
  VIEW: '閲覧のみ',
  EDIT: '編集',
  FULL: 'フルアクセス',
}

// 権限ロール: OWNER=社長, ADMIN=管理者, MEMBER=一般社員, ACCOUNTANT=経理
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'ACCOUNTANT'

// 権限ロールの日本語表示名
export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: '社長',
  ADMIN: '管理者',
  MEMBER: '一般社員',
  ACCOUNTANT: '経理'
}

// 各ロールがアクセスできるメニュー項目
export const ROLE_MENU_ACCESS: Record<UserRole, string[]> = {
  OWNER: [
    'dashboard', 'calendar', 'seminars', 'archives', 'community',
    'databooks', 'newsletters', 'digital-newspaper', 'site-visits', 'online-site-visits', 'tools', 'qualifications',
    'members', 'organization', 'billing', 'security', 'settings'
  ],
  ADMIN: [
    'dashboard', 'calendar', 'seminars', 'archives', 'community',
    'databooks', 'newsletters', 'digital-newspaper', 'site-visits', 'online-site-visits', 'tools', 'qualifications',
    'members', 'organization', 'security', 'settings'
  ],
  MEMBER: [
    'dashboard', 'calendar', 'seminars', 'archives', 'community',
    'databooks', 'newsletters', 'digital-newspaper', 'site-visits', 'online-site-visits', 'tools', 'qualifications',
    'settings'
  ],
  ACCOUNTANT: [
    'dashboard', 'calendar', 'billing', 'settings'
  ]
}

export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CONVENIENCE_STORE'

export type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PENDING'

export interface Organization {
  id: string
  name: string
  slug: string
  type: 'REFORM_COMPANY' | 'CUSTOMER'
  createdAt: Date
  updatedAt: Date
  // 追加フィールド（オプショナル）
  maxMembers?: number
  memberCount?: number
  email?: string
  phone?: string
  address?: string
  website?: string
  industry?: string
  description?: string
  existingSubscriptionTypes?: string[]
  adminNotes?: string
}

export interface User {
  id: string
  email: string
  name: string | null
  userType: 'EMPLOYEE' | 'CUSTOMER'
  emailVerified: boolean
  mfaEnabled?: boolean
  adminPermissionLevel?: AdminPermissionLevel | null
  createdAt: Date
  updatedAt: Date
}

export interface UserWithOrg extends User {
  organization: Organization
  role: UserRole
  subscription: Subscription | null
}

export interface Subscription {
  id: string
  organizationId: string
  planType: PlanType
  status: SubscriptionStatus
  paymentMethod: PaymentMethod
  discountType?: DiscountType
  basePrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  autoRenewal: boolean
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAt: Date | null
  canceledAt: Date | null
}

export interface Entitlement {
  feature: string
  limit: number | null
}

export const PLAN_FEATURES: Record<PlanType, string[]> = {
  STANDARD: [
    'seminar',
    'archive',
    'tools'
  ],
  EXPERT: [
    'seminar',
    'archive',
    'tools',
    'community',
    'databook',
    'newsletter'
  ]
}

export const PLAN_PRICES: Record<PlanType, { regular: number; current: number }> = {
  STANDARD: {
    regular: 110000,
    current: 110000  // 正規料金（年額・税込）
  },
  EXPERT: {
    regular: 220000,
    current: 220000  // 正規料金（年額・税込）
  }
}

// 既存購読者向け割引額（税込）
export const EXISTING_SUBSCRIBER_DISCOUNT = 22000

export interface SeminarCategory {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
}

export interface Seminar {
  id: string
  categoryId: string
  category?: SeminarCategory
  title: string
  description: string | null
  instructor: string | null
  imageUrl: string | null
  zoomUrl: string | null
  scheduledAt: Date
  duration: number | null
  isPublic: boolean
  publicPrice: number | null
}

export interface Archive {
  id: string
  categoryId: string
  category?: SeminarCategory
  title: string
  description: string | null
  youtubeUrl: string
  thumbnailUrl: string | null
  duration: number | null
  publishedAt: Date
}

export interface CommunityCategory {
  id: string
  name: string
  slug: string
  description: string | null
  meetingUrl: string | null
  sortOrder: number
}

export interface CommunityPost {
  id: string
  categoryId: string
  category?: CommunityCategory
  authorId: string
  authorName?: string
  title: string
  content: string
  attachments: string[]
  createdAt: Date
  updatedAt: Date
}

export interface MeetingArchive {
  id: string
  categoryId: string
  category?: CommunityCategory
  title: string
  description: string | null
  youtubeUrl: string
  heldAt: Date
}

export interface ActivityLog {
  id: string
  userId: string
  orgId: string | null
  activityType: 'seminar_register' | 'seminar_attend' | 'archive_view' | 'community_view' | 'community_post'
  resourceType: 'seminar' | 'archive' | 'community' | null
  resourceId: string | null
  createdAt: Date
}

export interface MemberActivity {
  userId: string
  userName: string
  email: string
  seminarCount: number
  archiveCount: number
  communityCount: number
  lastActivityAt: Date | null
}
