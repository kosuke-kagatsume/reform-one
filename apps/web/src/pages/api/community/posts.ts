import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { categoryId, limit, offset } = req.query

    try {
      const where: any = {}

      if (categoryId) {
        where.categoryId = categoryId
      }

      const posts = await prisma.communityPost.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit as string) : 20,
        skip: offset ? parseInt(offset as string) : 0
      })

      const authorIds = [...new Set(posts.map(p => p.authorId))]
      const authors = await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true }
      })
      const authorMap = new Map(authors.map(a => [a.id, a.name]))

      const postsWithAuthors = posts.map(post => ({
        ...post,
        attachments: JSON.parse(post.attachments),
        authorName: authorMap.get(post.authorId) || 'Unknown'
      }))

      const total = await prisma.communityPost.count({ where })

      return res.status(200).json({ posts: postsWithAuthors, total })
    } catch (error) {
      console.error('Get posts error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { categoryId, authorId, orgId, title, content, attachments } = req.body

    if (!categoryId || !authorId || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      const post = await prisma.communityPost.create({
        data: {
          categoryId,
          authorId,
          title,
          content,
          attachments: JSON.stringify(attachments || [])
        },
        include: { category: true }
      })

      await prisma.activityLog.create({
        data: {
          userId: authorId,
          orgId,
          activityType: 'community_post',
          resourceType: 'community',
          resourceId: post.id
        }
      })

      // Get author name for notification
      const author = await prisma.user.findUnique({
        where: { id: authorId },
        select: { name: true }
      })

      // Send email notification to Expert users (async, don't wait)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      fetch(`${baseUrl}/api/notifications/community-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          categoryName: post.category.name,
          categorySlug: post.category.slug,
          postTitle: post.title,
          authorName: author?.name || 'Unknown'
        })
      }).catch(err => console.error('Failed to send notification:', err))

      return res.status(201).json({
        post: {
          ...post,
          attachments: JSON.parse(post.attachments)
        }
      })
    } catch (error) {
      console.error('Create post error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
