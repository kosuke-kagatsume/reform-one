import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: 通知設定取得
  if (req.method === 'GET') {
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ユーザーIDが必要です')
    }

    try {
      const preference = await prisma.notificationPreference.findUnique({
        where: { userId }
      })

      // 設定がない場合はデフォルト値を返す
      if (!preference) {
        return success(res, {
          seminarEmail: true,
          seminarInApp: true,
          archiveEmail: true,
          archiveInApp: true,
          databookEmail: true,
          databookInApp: true,
          newsletterEmail: true,
          newsletterInApp: true,
          communityEmail: true,
          communityInApp: true,
          siteVisitEmail: true,
          siteVisitInApp: true,
          systemEmail: true,
          systemInApp: true
        })
      }

      return success(res, preference)
    } catch (err) {
      console.error('Get notification preference error:', err)
      return internalError(res)
    }
  }

  // PUT: 通知設定更新
  if (req.method === 'PUT') {
    const {
      userId,
      seminarEmail,
      seminarInApp,
      archiveEmail,
      archiveInApp,
      databookEmail,
      databookInApp,
      newsletterEmail,
      newsletterInApp,
      communityEmail,
      communityInApp,
      siteVisitEmail,
      siteVisitInApp,
      systemEmail,
      systemInApp
    } = req.body

    if (!userId) {
      return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ユーザーIDが必要です')
    }

    try {
      // upsert: 存在すれば更新、なければ作成
      const preference = await prisma.notificationPreference.upsert({
        where: { userId },
        update: {
          seminarEmail: seminarEmail ?? true,
          seminarInApp: seminarInApp ?? true,
          archiveEmail: archiveEmail ?? true,
          archiveInApp: archiveInApp ?? true,
          databookEmail: databookEmail ?? true,
          databookInApp: databookInApp ?? true,
          newsletterEmail: newsletterEmail ?? true,
          newsletterInApp: newsletterInApp ?? true,
          communityEmail: communityEmail ?? true,
          communityInApp: communityInApp ?? true,
          siteVisitEmail: siteVisitEmail ?? true,
          siteVisitInApp: siteVisitInApp ?? true,
          // システム通知は常にtrue
          systemEmail: true,
          systemInApp: true
        },
        create: {
          userId,
          seminarEmail: seminarEmail ?? true,
          seminarInApp: seminarInApp ?? true,
          archiveEmail: archiveEmail ?? true,
          archiveInApp: archiveInApp ?? true,
          databookEmail: databookEmail ?? true,
          databookInApp: databookInApp ?? true,
          newsletterEmail: newsletterEmail ?? true,
          newsletterInApp: newsletterInApp ?? true,
          communityEmail: communityEmail ?? true,
          communityInApp: communityInApp ?? true,
          siteVisitEmail: siteVisitEmail ?? true,
          siteVisitInApp: siteVisitInApp ?? true,
          systemEmail: true,
          systemInApp: true
        }
      })

      return success(res, preference, '通知設定を更新しました')
    } catch (err) {
      console.error('Update notification preference error:', err)
      return internalError(res)
    }
  }

  return methodNotAllowed(res, ['GET', 'PUT'])
}
