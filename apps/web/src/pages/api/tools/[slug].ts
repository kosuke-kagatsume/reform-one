import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await verifyAuth(req)
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Only REFORM_COMPANY employees can manage tools
  const isAdmin = auth.userType === 'EMPLOYEE'
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { slug: id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Tool ID is required' })
  }

  if (req.method === 'PUT') {
    try {
      const { name, description, category, iconName, requiredPlan, fileUrl, externalUrl, isPublished } = req.body

      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' })
      }

      const tool = await prisma.tool.update({
        where: { id },
        data: {
          name,
          description: description || null,
          category,
          iconName: iconName || null,
          requiredPlan: requiredPlan || 'STANDARD',
          fileUrl: fileUrl || null,
          externalUrl: externalUrl || null,
          isPublished: isPublished ?? true
        }
      })

      return res.status(200).json({ tool })
    } catch (error) {
      console.error('Update tool error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.tool.delete({
        where: { id }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete tool error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
