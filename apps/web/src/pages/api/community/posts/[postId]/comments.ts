import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.query

  if (typeof postId !== 'string') {
    return res.status(400).json({ error: 'Invalid post ID' })
  }

  if (req.method === 'GET') {
    try {
      const comments = await prisma.communityComment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' }
      })

      // Get author names
      const authorIds = [...new Set(comments.map(c => c.authorId))]
      const users = await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true, email: true }
      })
      const userMap = new Map(users.map(u => [u.id, u.name || u.email]))

      const commentsWithAuthor = comments.map(comment => ({
        ...comment,
        authorName: userMap.get(comment.authorId) || 'Unknown'
      }))

      return res.status(200).json({ comments: commentsWithAuthor })
    } catch (error) {
      console.error('Get comments error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { authorId, content } = req.body

    if (!authorId || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      // Check if post exists
      const post = await prisma.communityPost.findUnique({
        where: { id: postId }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const comment = await prisma.communityComment.create({
        data: {
          postId,
          authorId,
          content
        }
      })

      // Get author name
      const user = await prisma.user.findUnique({
        where: { id: authorId },
        select: { name: true, email: true }
      })

      return res.status(201).json({
        comment: {
          ...comment,
          authorName: user?.name || user?.email || 'Unknown'
        }
      })
    } catch (error) {
      console.error('Create comment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
