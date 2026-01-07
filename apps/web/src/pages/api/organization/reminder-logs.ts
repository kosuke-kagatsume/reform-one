import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

// B-6: リマインドメール送信履歴API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    // ユーザーの組織を取得
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: auth.userId },
      include: { organization: true }
    })

    if (!userOrg || userOrg.role !== 'ADMIN') {
      return error(res, ErrorCodes.FORBIDDEN, '管理者権限が必要です')
    }

    const { memberId, limit = '50', offset = '0' } = req.query

    const where: Prisma.ReminderLogWhereInput = {
      organizationId: userOrg.organizationId
    }

    // 特定メンバーのログのみ取得
    if (memberId && typeof memberId === 'string') {
      where.userId = memberId
    }

    const [logs, total] = await Promise.all([
      prisma.reminderLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10)
      }),
      prisma.reminderLog.count({ where })
    ])

    // ユーザー名を追加
    const userIds = [...new Set(logs.map(log => log.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    })

    const userMap = new Map(users.map(u => [u.id, u]))

    const logsWithUser = logs.map(log => ({
      ...log,
      user: userMap.get(log.userId)
    }))

    // 統計情報
    const stats = await prisma.reminderLog.groupBy({
      by: ['status'],
      where: { organizationId: userOrg.organizationId },
      _count: true
    })

    const statsMap = {
      sent: 0,
      failed: 0,
      opened: 0,
      clicked: 0
    }

    stats.forEach((s: { status: string; _count: number }) => {
      const key = s.status.toLowerCase() as keyof typeof statsMap
      if (key in statsMap) {
        statsMap[key] = s._count
      }
    })

    return success(res, {
      logs: logsWithUser,
      total,
      stats: statsMap
    })
  } catch (err) {
    console.error('Get reminder logs error:', err)
    return internalError(res)
  }
}
