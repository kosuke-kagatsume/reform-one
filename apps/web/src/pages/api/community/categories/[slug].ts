import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query

  if (typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  if (req.method === 'GET') {
    try {
      const category = await prisma.communityCategory.findUnique({
        where: { slug },
        include: {
          meetingArchives: {
            orderBy: { heldAt: 'desc' }
          },
          _count: {
            select: {
              posts: true,
              meetingArchives: true
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
    const { name, description, meetingUrl, sortOrder } = req.body

    try {
      const category = await prisma.communityCategory.update({
        where: { slug },
        data: {
          name,
          description,
          meetingUrl,
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
      // Delete related records first
      const category = await prisma.communityCategory.findUnique({
        where: { slug }
      })

      if (!category) {
        return res.status(404).json({ error: 'Category not found' })
      }

      await prisma.meetingArchive.deleteMany({ where: { categoryId: category.id } })
      await prisma.communityPost.deleteMany({ where: { categoryId: category.id } })

      await prisma.communityCategory.delete({
        where: { slug }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete category error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
