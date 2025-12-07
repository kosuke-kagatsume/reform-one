import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    if (req.method === 'GET') {
      const tool = await prisma.tool.findUnique({
        where: { id },
        include: {
          _count: {
            select: { usageLogs: true },
          },
        },
      })

      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' })
      }

      return res.status(200).json({
        ...tool,
        usageCount: tool._count.usageLogs,
      })
    }

    if (req.method === 'PUT') {
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

      const tool = await prisma.tool.update({
        where: { id },
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

      return res.status(200).json(tool)
    }

    if (req.method === 'DELETE') {
      await prisma.tool.delete({
        where: { id },
      })

      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin tool error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
