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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: 通知一覧取得
  if (req.method === 'GET') {
    const { userId } = req.query

    if (!userId || typeof userId !== 'string') {
      return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ユーザーIDが必要です')
    }

    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      })

      const unreadCount = await prisma.notification.count({
        where: { userId, read: false }
      })

      return success(res, {
        notifications,
        unreadCount
      })
    } catch (err) {
      console.error('Get notifications error:', err)
      return internalError(res)
    }
  }

  // POST: 通知作成（A-5）
  if (req.method === 'POST') {
    try {
      const auth = await verifyAuth(req)
      if (!auth) {
        return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
      }

      const { userId, type, title, message, link } = req.body

      if (!userId || !type || !title || !message) {
        return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, '必須項目が不足しています')
      }

      // 通知作成
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link: link || null
        }
      })

      // メール送信連携（A-6）- 通知設定を確認
      try {
        const preference = await prisma.notificationPreference.findUnique({
          where: { userId }
        })

        // 設定がない場合はデフォルトでメール送信
        const shouldSendEmail = !preference || getEmailPreference(preference, type)

        if (shouldSendEmail) {
          // TODO: メール送信処理（別途メール送信サービス実装後に連携）
          console.log(`Email notification queued for user ${userId}: ${title}`)
        }
      } catch (prefError) {
        console.error('Failed to check notification preference:', prefError)
        // エラーでも通知自体は作成済みなので続行
      }

      return success(res, { notification })
    } catch (err) {
      console.error('Create notification error:', err)
      return internalError(res)
    }
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}

// 通知種類に応じたメール設定を取得
function getEmailPreference(preference: any, type: string): boolean {
  switch (type) {
    case 'SEMINAR':
      return preference.seminarEmail
    case 'ARCHIVE':
      return preference.archiveEmail
    case 'DATABOOK':
      return preference.databookEmail
    case 'NEWSLETTER':
      return preference.newsletterEmail
    case 'COMMUNITY':
      return preference.communityEmail
    case 'SITE_VISIT':
      return preference.siteVisitEmail
    case 'SYSTEM':
    default:
      return preference.systemEmail
  }
}
