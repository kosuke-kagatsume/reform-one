export type PlanType = 'STANDARD' | 'EXPERT'

export type UserRole = 'ADMIN' | 'MEMBER'

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
    current: 55000
  },
  EXPERT: {
    regular: 220000,
    current: 165000
  }
}

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
