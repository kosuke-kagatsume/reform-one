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

// A-4: ユーザープロフィール質問API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    // GET: プロフィール取得
    if (req.method === 'GET') {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: auth.userId }
      })

      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: {
          id: true,
          name: true,
          email: true
        }
      })

      return success(res, {
        user,
        profile: profile || null,
        hasProfile: !!profile
      })
    }

    // POST: プロフィール作成/更新
    if (req.method === 'POST') {
      const {
        department,
        jobTitle,
        industryCategory,
        companySize,
        interests,
        subscriptionGoal
      } = req.body

      // interests が配列の場合はJSON文字列に変換
      const interestsJson = Array.isArray(interests) ? JSON.stringify(interests) : interests

      const profile = await prisma.userProfile.upsert({
        where: { userId: auth.userId },
        update: {
          department,
          jobTitle,
          industryCategory,
          companySize,
          interests: interestsJson,
          subscriptionGoal
        },
        create: {
          userId: auth.userId,
          department,
          jobTitle,
          industryCategory,
          companySize,
          interests: interestsJson,
          subscriptionGoal
        }
      })

      return success(res, { profile }, 'プロフィールを保存しました')
    }

    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (err) {
    console.error('Profile API error:', err)
    return internalError(res)
  }
}
