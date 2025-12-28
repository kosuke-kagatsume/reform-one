export type PlanType = 'STANDARD' | 'EXPERT'

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
    'dashboard', 'seminars', 'archives', 'community',
    'databooks', 'newsletters', 'site-visits', 'tools', 'qualifications',
    'members', 'organization', 'billing', 'security', 'settings'
  ],
  ADMIN: [
    'dashboard', 'seminars', 'archives', 'community',
    'databooks', 'newsletters', 'site-visits', 'tools', 'qualifications',
    'members', 'organization', 'security', 'settings'
  ],
  MEMBER: [
    'dashboard', 'seminars', 'archives', 'community',
    'databooks', 'newsletters', 'site-visits', 'tools', 'qualifications',
    'settings'
  ],
  ACCOUNTANT: [
    'dashboard', 'billing', 'settings'
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
}

export interface User {
  id: string
  email: string
  name: string | null
  userType: 'EMPLOYEE' | 'CUSTOMER'
  emailVerified: boolean
  mfaEnabled?: boolean
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
    'archive'
  ],
  EXPERT: [
    'seminar',
    'archive',
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
