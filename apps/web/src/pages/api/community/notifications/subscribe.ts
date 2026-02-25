import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await verifyAuth(req)
  if (!auth) {
    return res.status(401).json({ error: '認証が必要です' })
  }

  // GET: 現在の購読状態を取得
  if (req.method === 'GET') {
    const { categoryId } = req.query

    if (!categoryId || typeof categoryId !== 'string') {
      return res.status(400).json({ error: 'categoryIdが必要です' })
    }

    try {
      const subscription = await prisma.communityNotificationSubscription.findUnique({
        where: {
          userId_categoryId: {
            userId: auth.userId,
            categoryId
          }
        }
      })

      return res.status(200).json({
        subscribed: subscription?.isActive ?? false
      })
    } catch (error) {
      console.error('Failed to get subscription status:', error)
      return res.status(500).json({ error: '購読状態の取得に失敗しました' })
    }
  }

  // POST: 購読を登録/解除
  if (req.method === 'POST') {
    const { categoryId, subscribe } = req.body

    if (!categoryId || typeof subscribe !== 'boolean') {
      return res.status(400).json({ error: 'categoryIdとsubscribeが必要です' })
    }

    try {
      // カテゴリの存在確認
      const category = await prisma.communityCategory.findUnique({
        where: { id: categoryId }
      })
      if (!category) {
        return res.status(404).json({ error: '指定されたカテゴリが存在しません' })
      }

      if (subscribe) {
        // 購読を登録
        await prisma.communityNotificationSubscription.upsert({
          where: {
            userId_categoryId: {
              userId: auth.userId,
              categoryId
            }
          },
          update: {
            isActive: true
          },
          create: {
            userId: auth.userId,
            categoryId,
            isActive: true
          }
        })
      } else {
        // 購読を解除（isActiveをfalseに）
        await prisma.communityNotificationSubscription.upsert({
          where: {
            userId_categoryId: {
              userId: auth.userId,
              categoryId
            }
          },
          update: {
            isActive: false
          },
          create: {
            userId: auth.userId,
            categoryId,
            isActive: false
          }
        })
      }

      return res.status(200).json({
        success: true,
        subscribed: subscribe
      })
    } catch (error) {
      console.error('Failed to update subscription:', error)
      return res.status(500).json({ error: '購読設定の更新に失敗しました' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
