export * from '@prisma/client'
export { PrismaClient } from '@prisma/client'

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Export custom enum types for SQLite
export const Role = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
} as const

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
} as const

export const PlanType = {
  PREMIUM_10M: 'PREMIUM_10M',
  PREMIUM_20M: 'PREMIUM_20M',
  BASIC: 'BASIC',
} as const

export const ContentStatus = {
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const

export type Role = typeof Role[keyof typeof Role]
export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus]
export type PlanType = typeof PlanType[keyof typeof PlanType]
export type ContentStatus = typeof ContentStatus[keyof typeof ContentStatus]