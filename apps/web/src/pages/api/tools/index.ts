import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const auth = await verifyAuth(req)
      if (!auth) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Get user's subscription plan
      const userOrg = await prisma.userOrganization.findFirst({
        where: { userId: auth.userId },
        include: {
          organization: {
            include: {
              subscriptions: {
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      })

      const userPlan = userOrg?.organization?.subscriptions[0]?.planType || 'STANDARD'

      const { category } = req.query

      // Get tools based on user's plan
      const tools = await prisma.tool.findMany({
        where: {
          isPublished: true,
          ...(category && { category: category as string }),
          requiredPlan: {
            in: userPlan === 'EXPERT' ? ['STANDARD', 'EXPERT'] : ['STANDARD'],
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })

      return res.status(200).json(tools)
    } catch (error) {
      console.error('Get tools error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Admin only: Create tool
    try {
      const auth = await verifyAuth(req)
      if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const {
        name,
        slug,
        description,
        category,
        fileUrl,
        externalUrl,
        iconName,
        requiredPlan,
        sortOrder,
        isPublished,
      } = req.body

      if (!name || !slug || !category) {
        return res.status(400).json({ error: 'Name, slug, and category are required' })
      }

      const tool = await prisma.tool.create({
        data: {
          name,
          slug,
          description,
          category,
          fileUrl,
          externalUrl,
          iconName,
          requiredPlan: requiredPlan || 'STANDARD',
          sortOrder: sortOrder ?? 0,
          isPublished: isPublished ?? true,
        },
      })

      return res.status(201).json(tool)
    } catch (error) {
      console.error('Create tool error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
