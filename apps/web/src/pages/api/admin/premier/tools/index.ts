import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (req.method === 'GET') {
      const tools = await prisma.tool.findMany({
        include: {
          _count: {
            select: { usageLogs: true },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })

      const result = tools.map((t) => ({
        ...t,
        usageCount: t._count.usageLogs,
      }))

      return res.status(200).json(result)
    }

    if (req.method === 'POST') {
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
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin tools error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
