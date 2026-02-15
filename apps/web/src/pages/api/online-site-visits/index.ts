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

// ユーザー向け: オンライン現場見学会一覧API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    // ユーザーのプランを取得
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: auth.userId },
      include: {
        organization: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              take: 1
            }
          }
        }
      }
    })

    const planType = userOrg?.organization?.subscriptions?.[0]?.planType || 'STANDARD'

    const { upcoming } = req.query
    const now = new Date()

    // プランに応じた見学会を取得
    const whereCondition: any = {
      isPublished: true,
      isCanceled: false
    }

    // STANDARDユーザーはSTANDARDのみ、EXPERTはすべて見られる
    if (planType === 'STANDARD') {
      whereCondition.requiredPlan = 'STANDARD'
    }

    if (upcoming === 'true') {
      whereCondition.scheduledAt = { gte: now }
    }

    const onlineSiteVisits = await prisma.onlineSiteVisit.findMany({
      where: whereCondition,
      include: {
        _count: {
          select: { participants: true }
        },
        participants: {
          where: { userId: auth.userId },
          select: { id: true, status: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    // 参加状態を追加
    const result = onlineSiteVisits.map(visit => ({
      id: visit.id,
      title: visit.title,
      description: visit.description,
      companyName: visit.companyName,
      location: visit.location,
      imageUrl: visit.imageUrl,
      scheduledAt: visit.scheduledAt,
      duration: visit.duration,
      capacity: visit.capacity,
      requiredPlan: visit.requiredPlan,
      participantCount: visit._count.participants,
      isRegistered: visit.participants.length > 0,
      registrationStatus: visit.participants[0]?.status || null,
      isFull: visit._count.participants >= visit.capacity
    }))

    return success(res, { onlineSiteVisits: result })
  } catch (err) {
    console.error('Online site visits list error:', err)
    return internalError(res)
  }
}
