import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'GET') {
    try {
      const category = await prisma.seminarCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              seminars: true,
              archives: true
            }
          }
        }
      })

      if (!category) {
        return res.status(404).json({ error: 'Category not found' })
      }

      return res.status(200).json({ category })
    } catch (error) {
      console.error('Get category error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const { name, slug, description, sortOrder } = req.body

    try {
      const category = await prisma.seminarCategory.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          sortOrder
        }
      })

      return res.status(200).json({ category })
    } catch (error) {
      console.error('Update category error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if category has seminars or archives
      const category = await prisma.seminarCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              seminars: true,
              archives: true
            }
          }
        }
      })

      if (!category) {
        return res.status(404).json({ error: 'Category not found' })
      }

      if (category._count.seminars > 0 || category._count.archives > 0) {
        return res.status(400).json({
          error: 'このカテゴリには関連するセミナーまたはアーカイブがあるため削除できません'
        })
      }

      await prisma.seminarCategory.delete({
        where: { id }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete category error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
