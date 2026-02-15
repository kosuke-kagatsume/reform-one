import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'
import { sendOnlineSiteVisitNotification, shouldSendNotification } from '@/lib/event-notification'

// 管理者用: オンライン現場見学会一覧・作成API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.userType !== 'EMPLOYEE') {
      return error(res, ErrorCodes.UNAUTHORIZED, '管理者権限が必要です')
    }

    // GET: 一覧取得
    if (req.method === 'GET') {
      const { upcoming, past } = req.query

      const now = new Date()
      let dateFilter = {}

      if (upcoming === 'true') {
        dateFilter = { scheduledAt: { gte: now } }
      } else if (past === 'true') {
        dateFilter = { scheduledAt: { lt: now } }
      }

      const onlineSiteVisits = await prisma.onlineSiteVisit.findMany({
        where: dateFilter,
        include: {
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { scheduledAt: 'desc' }
      })

      const stats = {
        total: onlineSiteVisits.length,
        upcoming: onlineSiteVisits.filter(v => new Date(v.scheduledAt) >= now).length,
        past: onlineSiteVisits.filter(v => new Date(v.scheduledAt) < now).length,
        published: onlineSiteVisits.filter(v => v.isPublished).length
      }

      return success(res, { onlineSiteVisits, stats })
    }

    // POST: 新規作成
    if (req.method === 'POST') {
      const {
        title,
        description,
        companyName,
        location,
        imageUrl,
        zoomUrl,
        scheduledAt,
        duration,
        capacity,
        requiredPlan,
        isPublished
      } = req.body

      if (!title || !scheduledAt) {
        return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'タイトルと開催日時は必須です')
      }

      const onlineSiteVisit = await prisma.onlineSiteVisit.create({
        data: {
          title,
          description,
          companyName,
          location,
          imageUrl,
          zoomUrl,
          scheduledAt: new Date(scheduledAt),
          duration: duration ? parseInt(duration, 10) : null,
          capacity: capacity ? parseInt(capacity, 10) : 100,
          requiredPlan: requiredPlan || 'STANDARD',
          isPublished: isPublished ?? false
        }
      })

      // 操作ログ
      await prisma.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'online_site_visit.create',
          resource: onlineSiteVisit.id,
          metadata: JSON.stringify({ title })
        }
      })

      // A-3: オンライン見学会作成時に自動メール送信（公開設定の場合）
      if (shouldSendNotification(onlineSiteVisit.isPublished, null)) {
        sendOnlineSiteVisitNotification({
          id: onlineSiteVisit.id,
          title: onlineSiteVisit.title,
          scheduledAt: onlineSiteVisit.scheduledAt,
          description: onlineSiteVisit.description,
          companyName: onlineSiteVisit.companyName,
          location: onlineSiteVisit.location,
          requiredPlan: onlineSiteVisit.requiredPlan,
        }).catch((err) => console.error('Failed to send online site visit notification:', err))
      }

      return success(res, { onlineSiteVisit }, 'オンライン現場見学会を作成しました')
    }

    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (err) {
    console.error('Online site visits API error:', err)
    return internalError(res)
  }
}
