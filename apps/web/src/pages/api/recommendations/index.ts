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

      const { position } = req.query
      const now = new Date()

      // Get user's subscription plan and account age
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
      const joinedAt = userOrg?.joinedAt
      const isNewUser = joinedAt && (now.getTime() - joinedAt.getTime()) < 30 * 24 * 60 * 60 * 1000 // 30 days

      // Get user's dismissed recommendations
      const dismissedIds = await prisma.recommendationDismissal.findMany({
        where: { userId: auth.userId },
        select: { recommendationId: true },
      })
      const dismissedSet = new Set(dismissedIds.map((d) => d.recommendationId))

      // Build target types for this user
      const targetTypes = ['ALL']
      targetTypes.push(userPlan) // STANDARD or EXPERT
      if (isNewUser) targetTypes.push('NEW_USER')

      // Get active recommendations
      const recommendations = await prisma.recommendation.findMany({
        where: {
          isActive: true,
          targetType: { in: targetTypes },
          ...(position && { position: position as string }),
          OR: [
            { startAt: null },
            { startAt: { lte: now } },
          ],
          AND: [
            {
              OR: [
                { endAt: null },
                { endAt: { gte: now } },
              ],
            },
          ],
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      })

      // Filter out dismissed ones
      const filtered = recommendations.filter((r) => !dismissedSet.has(r.id))

      return res.status(200).json(filtered)
    } catch (error) {
      console.error('Get recommendations error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Admin only: Create recommendation
    try {
      const auth = await verifyAuth(req)
      if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const {
        title,
        description,
        imageUrl,
        linkUrl,
        linkText,
        targetType,
        position,
        priority,
        startAt,
        endAt,
        isActive,
      } = req.body

      if (!title || !linkUrl || !targetType) {
        return res.status(400).json({ error: 'Title, linkUrl, and targetType are required' })
      }

      const recommendation = await prisma.recommendation.create({
        data: {
          title,
          description,
          imageUrl,
          linkUrl,
          linkText: linkText || '詳細を見る',
          targetType,
          position: position || 'POPUP',
          priority: priority ?? 0,
          startAt: startAt ? new Date(startAt) : null,
          endAt: endAt ? new Date(endAt) : null,
          isActive: isActive ?? true,
        },
      })

      return res.status(201).json(recommendation)
    } catch (error) {
      console.error('Create recommendation error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
