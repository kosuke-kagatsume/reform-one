import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdminPermission } from '@/lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { authorized, error } = await requireAdminPermission(req, 'VIEW')
  if (!authorized) return res.status(403).json({ error })

  const { action, userId, startDate, endDate, limit = '50', offset = '0' } = req.query

  const parsedLimit = Math.min(Math.max(parseInt(limit as string) || 50, 1), 100)
  const parsedOffset = Math.max(parseInt(offset as string) || 0, 0)

  try {
    const where: Record<string, unknown> = {}

    if (action && typeof action === 'string') {
      where.action = action
    }

    if (userId && typeof userId === 'string') {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate && typeof startDate === 'string') {
        (where.timestamp as any).gte = new Date(startDate)
      }
      if (endDate && typeof endDate === 'string') {
        (where.timestamp as any).lte = new Date(endDate + 'T23:59:59.999Z')
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: parsedLimit,
        skip: parsedOffset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ])

    const logsWithParsedMetadata = logs.map(log => {
      let parsedMetadata = null
      if (log.metadata) {
        try {
          parsedMetadata = JSON.parse(log.metadata)
        } catch {}
      }
      return { ...log, metadata: parsedMetadata }
    })

    return res.status(200).json({
      logs: logsWithParsedMetadata,
      total,
      limit: parsedLimit,
      offset: parsedOffset
    })
  } catch (error) {
    console.error('Get audit log error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
