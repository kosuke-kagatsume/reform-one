import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth, getUserPlanType } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const auth = await verifyAuth(req)
    if (!auth) {
      return res.status(401).json({ error: '認証が必要です' })
    }

    // リフォーム産業新聞社は全機能アクセス可能
    if (auth.userType !== 'EMPLOYEE') {
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
      const categories = await prisma.communityCategory.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: {
              posts: true,
              meetingArchives: true
            }
          }
        }
      })

      return res.status(200).json({ categories })
    } catch (error) {
      console.error('Get community categories error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { name, slug, description, meetingUrl, sortOrder } = req.body

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' })
    }

    try {
      const category = await prisma.communityCategory.create({
        data: {
          name,
          slug,
          description,
          meetingUrl,
          sortOrder: sortOrder || 0
        }
      })

      return res.status(201).json({ category })
    } catch (error) {
      console.error('Create community category error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PATCH') {
    const { id, meetingUrl } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' })
    }

    try {
      const category = await prisma.communityCategory.update({
        where: { id },
        data: { meetingUrl }
      })

      return res.status(200).json({ category })
    } catch (error) {
      console.error('Update community category error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
