import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

// B-4: 自動送信バッチ - cron: 未ログイン者検出＆送信
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  // Cron認証（Vercel Cronまたはカスタムキー）
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
  }

  try {
    // 有効なリマインド設定を持つ組織を取得
    const reminderSettings = await prisma.reminderSetting.findMany({
      where: { enabled: true }
    })

    let totalSent = 0
    const results: { organizationId: string; sent: number; errors: string[] }[] = []

    for (const setting of reminderSettings) {
      const orgResult = { organizationId: setting.organizationId, sent: 0, errors: [] as string[] }

      try {
        // 組織のユーザーを取得
        const organization = await prisma.organization.findUnique({
          where: { id: setting.organizationId },
          include: {
            users: {
              include: {
                user: true
              }
            }
          }
        })

        if (!organization) {
          orgResult.errors.push('組織が見つかりません')
          results.push(orgResult)
          continue
        }

        // 未ログイン日数を超えたユーザーを抽出
        const thresholdDate = new Date()
        thresholdDate.setDate(thresholdDate.getDate() - setting.daysThreshold)

        const inactiveUsers = organization.users.filter(userOrg => {
          const user = userOrg.user
          // 最終ログインがない、または閾値を超えている
          if (!user.lastLoginAt) return true
          return new Date(user.lastLoginAt) < thresholdDate
        })

        // 各ユーザーにリマインドメールを送信
        for (const userOrg of inactiveUsers) {
          const user = userOrg.user

          // 直近で既に送信済みかチェック（7日以内）
          const recentReminder = await prisma.reminderLog.findFirst({
            where: {
              userId: user.id,
              organizationId: setting.organizationId,
              sentAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7日以内
              }
            }
          })

          if (recentReminder) {
            continue // 既に送信済み
          }

          // 未ログイン日数を計算
          const daysInactive = user.lastLoginAt
            ? Math.floor((Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24))
            : 999 // 一度もログインしていない

          try {
            // メール送信（TODO: 実際のメール送信サービスと連携）
            console.log(`Sending reminder to ${user.email} (${daysInactive} days inactive)`)

            // TODO: メール送信処理
            // await sendEmail({
            //   to: user.email,
            //   template: 'reminder',
            //   data: { organizationName: organization.name, userName: user.name }
            // })

            // 送信履歴を記録 (B-5)
            await prisma.reminderLog.create({
              data: {
                organizationId: setting.organizationId,
                userId: user.id,
                emailAddress: user.email,
                daysInactive,
                status: 'SENT'
              }
            })

            orgResult.sent++
            totalSent++
          } catch (emailError) {
            console.error(`Failed to send reminder to ${user.email}:`, emailError)

            // 失敗も記録
            await prisma.reminderLog.create({
              data: {
                organizationId: setting.organizationId,
                userId: user.id,
                emailAddress: user.email,
                daysInactive,
                status: 'FAILED'
              }
            })

            orgResult.errors.push(`${user.email}: メール送信失敗`)
          }
        }
      } catch (orgError) {
        console.error(`Error processing organization ${setting.organizationId}:`, orgError)
        orgResult.errors.push('組織の処理中にエラーが発生しました')
      }

      results.push(orgResult)
    }

    return success(res, {
      totalSent,
      organizationsProcessed: reminderSettings.length,
      results
    }, `${totalSent}件のリマインドメールを送信しました`)
  } catch (err) {
    console.error('Send reminders cron error:', err)
    return internalError(res)
  }
}
