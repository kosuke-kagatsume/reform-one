import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth, getUserPlanType } from '@/lib/auth'

// User API for viewing published newsletters (Expert plan only)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAuth(req)
  if (!auth) {
    return res.status(401).json({ error: '認証が必要です' })
  }

  // リフォーム産業新聞社は全機能アクセス可能
  if (auth.userType !== 'EMPLOYEE') {
    // EXPERTプランチェック
    if (auth.orgId) {
      const planType = await getUserPlanType(auth.orgId)
      if (planType !== 'EXPERT') {
        return res.status(403).json({ error: 'エキスパートプラン限定の機能です' })
      }
    } else {
      return res.status(403).json({ error: 'エキスパートプラン限定の機能です' })
    }
  }

  try {
    const newsletters = await prisma.newsletter.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        summary: true,
        sentAt: true,
        createdAt: true
      },
      orderBy: { sentAt: 'desc' }
    })

    return res.status(200).json({ newsletters })
  } catch (error) {
    console.error('Get newsletters error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
