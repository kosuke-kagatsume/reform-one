import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { slug } = req.query
  const { action } = req.body // VIEW, DOWNLOAD, USE

  if (typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get tool
    const tool = await prisma.tool.findUnique({
      where: { slug },
    })

    if (!tool || !tool.isPublished) {
      return res.status(404).json({ error: 'Tool not found' })
    }

    // Check user's plan
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

    if (tool.requiredPlan === 'EXPERT' && userPlan !== 'EXPERT') {
      return res.status(403).json({ error: 'Expert plan required for this tool' })
    }

    // Log usage
    await prisma.toolUsageLog.create({
      data: {
        toolId: tool.id,
        userId: auth.userId,
        action: action || 'USE',
      },
    })

    return res.status(200).json({
      success: true,
      tool: {
        id: tool.id,
        name: tool.name,
        fileUrl: tool.fileUrl,
        externalUrl: tool.externalUrl,
      },
    })
  } catch (error) {
    console.error('Use tool error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
