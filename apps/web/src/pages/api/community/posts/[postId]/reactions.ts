import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.query

  if (typeof postId !== 'string') {
    return res.status(400).json({ error: 'Invalid post ID' })
  }

  if (req.method === 'GET') {
    const { userId } = req.query

    try {
      // Get reaction counts by type
      const reactions = await prisma.communityReaction.groupBy({
        by: ['type'],
        where: { postId },
        _count: { type: true }
      })

      const reactionCounts: Record<string, number> = {}
      reactions.forEach(r => {
        reactionCounts[r.type] = r._count.type
      })

      // Check if user has reacted
      let userReactions: string[] = []
      if (userId && typeof userId === 'string') {
        const userReactionRecords = await prisma.communityReaction.findMany({
          where: { postId, userId },
          select: { type: true }
        })
        userReactions = userReactionRecords.map(r => r.type)
      }

      return res.status(200).json({ reactionCounts, userReactions })
    } catch (error) {
      console.error('Get reactions error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { userId, type = 'LIKE' } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' })
    }

    try {
      // Check if post exists
      const post = await prisma.communityPost.findUnique({
        where: { id: postId }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      // Toggle reaction (add if not exists, remove if exists)
      const existingReaction = await prisma.communityReaction.findUnique({
        where: {
          postId_userId_type: { postId, userId, type }
        }
      })

      if (existingReaction) {
        // Remove reaction
        await prisma.communityReaction.delete({
          where: { id: existingReaction.id }
        })
        return res.status(200).json({ action: 'removed', type })
      } else {
        // Add reaction
        await prisma.communityReaction.create({
          data: { postId, userId, type }
        })
        return res.status(201).json({ action: 'added', type })
      }
    } catch (error) {
      console.error('Toggle reaction error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
