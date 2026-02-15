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

// ユーザー向け: オンライン現場見学会 参加登録/キャンセルAPI
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'IDが必要です')
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    // POST: 参加登録
    if (req.method === 'POST') {
      // オンライン見学会を取得
      const onlineSiteVisit = await prisma.onlineSiteVisit.findUnique({
        where: { id },
        include: {
          _count: { select: { participants: true } }
        }
      })

      if (!onlineSiteVisit) {
        return error(res, ErrorCodes.NOT_FOUND, 'オンライン現場見学会が見つかりません')
      }

      if (!onlineSiteVisit.isPublished) {
        return error(res, ErrorCodes.FORBIDDEN, 'この見学会は公開されていません')
      }

      if (onlineSiteVisit.isCanceled) {
        return error(res, ErrorCodes.FORBIDDEN, 'この見学会は中止されました')
      }

      if (new Date(onlineSiteVisit.scheduledAt) < new Date()) {
        return error(res, ErrorCodes.FORBIDDEN, 'この見学会は既に終了しています')
      }

      if (onlineSiteVisit._count.participants >= onlineSiteVisit.capacity) {
        return error(res, ErrorCodes.FORBIDDEN, '定員に達しています')
      }

      // プランチェック
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

      const userPlan = userOrg?.organization?.subscriptions?.[0]?.planType || 'STANDARD'

      if (onlineSiteVisit.requiredPlan === 'EXPERT' && userPlan !== 'EXPERT') {
        return error(res, ErrorCodes.FORBIDDEN, 'エキスパートプラン限定のコンテンツです')
      }

      // 既存の登録をチェック
      const existing = await prisma.onlineSiteVisitParticipant.findUnique({
        where: {
          onlineSiteVisitId_userId: {
            onlineSiteVisitId: id,
            userId: auth.userId
          }
        }
      })

      if (existing) {
        if (existing.status === 'CANCELED') {
          // 再登録
          const updated = await prisma.onlineSiteVisitParticipant.update({
            where: { id: existing.id },
            data: {
              status: 'REGISTERED',
              registeredAt: new Date()
            }
          })
          return success(res, { participant: updated }, '参加登録を再開しました')
        }
        return error(res, ErrorCodes.ALREADY_EXISTS, '既に登録済みです')
      }

      // 新規登録
      const participant = await prisma.onlineSiteVisitParticipant.create({
        data: {
          onlineSiteVisitId: id,
          userId: auth.userId,
          organizationId: userOrg?.organizationId,
          status: 'REGISTERED'
        }
      })

      return success(res, { participant }, '参加登録しました')
    }

    // DELETE: キャンセル
    if (req.method === 'DELETE') {
      const existing = await prisma.onlineSiteVisitParticipant.findUnique({
        where: {
          onlineSiteVisitId_userId: {
            onlineSiteVisitId: id,
            userId: auth.userId
          }
        }
      })

      if (!existing) {
        return error(res, ErrorCodes.NOT_FOUND, '登録が見つかりません')
      }

      await prisma.onlineSiteVisitParticipant.update({
        where: { id: existing.id },
        data: { status: 'CANCELED' }
      })

      return success(res, null, '参加をキャンセルしました')
    }

    return methodNotAllowed(res, ['POST', 'DELETE'])
  } catch (err) {
    console.error('Online site visit registration error:', err)
    return internalError(res)
  }
}
