import { prisma } from '@/lib/prisma'

interface LogAdminActionParams {
  userId: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

export async function logAdminAction({
  userId,
  action,
  resource,
  resourceId,
  metadata,
  ip,
  userAgent
}: LogAdminActionParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: resource || null,
        metadata: metadata ? JSON.stringify({ ...metadata, resourceId }) : resourceId ? JSON.stringify({ resourceId }) : null,
        ip: ip || null,
        userAgent: userAgent || null
      }
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}
