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

// 管理者用: オンライン現場見学会 詳細・更新・削除API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'IDが必要です')
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.userType !== 'EMPLOYEE') {
      return error(res, ErrorCodes.UNAUTHORIZED, '管理者権限が必要です')
    }

    // GET: 詳細取得
    if (req.method === 'GET') {
      const onlineSiteVisit = await prisma.onlineSiteVisit.findUnique({
        where: { id },
        include: {
          participants: {
            include: {
              // Get user info
            }
          },
          _count: {
            select: { participants: true }
          }
        }
      })

      if (!onlineSiteVisit) {
        return error(res, ErrorCodes.NOT_FOUND, 'オンライン現場見学会が見つかりません')
      }

      // Get participant details
      const participantUserIds = onlineSiteVisit.participants.map(p => p.userId)
      const users = await prisma.user.findMany({
        where: { id: { in: participantUserIds } },
        select: { id: true, name: true, email: true }
      })
      const userMap = new Map(users.map(u => [u.id, u]))

      const participantsWithUser = onlineSiteVisit.participants.map(p => ({
        ...p,
        user: userMap.get(p.userId)
      }))

      return success(res, {
        ...onlineSiteVisit,
        participants: participantsWithUser
      })
    }

    // PUT: 更新
    if (req.method === 'PUT') {
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
        isPublished,
        isCanceled
      } = req.body

      const existing = await prisma.onlineSiteVisit.findUnique({ where: { id } })
      if (!existing) {
        return error(res, ErrorCodes.NOT_FOUND, 'オンライン現場見学会が見つかりません')
      }

      const onlineSiteVisit = await prisma.onlineSiteVisit.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          description: description !== undefined ? description : existing.description,
          companyName: companyName !== undefined ? companyName : existing.companyName,
          location: location !== undefined ? location : existing.location,
          imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
          zoomUrl: zoomUrl !== undefined ? zoomUrl : existing.zoomUrl,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : existing.scheduledAt,
          duration: duration !== undefined ? (duration ? parseInt(duration, 10) : null) : existing.duration,
          capacity: capacity !== undefined ? parseInt(capacity, 10) : existing.capacity,
          requiredPlan: requiredPlan ?? existing.requiredPlan,
          isPublished: isPublished !== undefined ? isPublished : existing.isPublished,
          isCanceled: isCanceled !== undefined ? isCanceled : existing.isCanceled
        }
      })

      // 操作ログ（A-6: ロールバック用にbefore状態を保存）
      await prisma.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'online_site_visit.update',
          resource: id,
          metadata: JSON.stringify({
            title: onlineSiteVisit.title,
            before: {
              isPublished: existing.isPublished,
              isCanceled: existing.isCanceled
            }
          })
        }
      })

      // A-3: 公開時に未送信なら自動メール送信
      if (shouldSendNotification(onlineSiteVisit.isPublished, existing.notificationSentAt)) {
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

      return success(res, { onlineSiteVisit }, 'オンライン現場見学会を更新しました')
    }

    // DELETE: 削除
    if (req.method === 'DELETE') {
      const existing = await prisma.onlineSiteVisit.findUnique({ where: { id } })
      if (!existing) {
        return error(res, ErrorCodes.NOT_FOUND, 'オンライン現場見学会が見つかりません')
      }

      await prisma.onlineSiteVisit.delete({ where: { id } })

      // 操作ログ
      await prisma.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'online_site_visit.delete',
          resource: id,
          metadata: JSON.stringify({ title: existing.title })
        }
      })

      return success(res, null, 'オンライン現場見学会を削除しました')
    }

    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
  } catch (err) {
    console.error('Online site visit API error:', err)
    return internalError(res)
  }
}
