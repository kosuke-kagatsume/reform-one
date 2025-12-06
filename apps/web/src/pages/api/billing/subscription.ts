import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Get subscription details for an organization
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { organizationId } = req.query

  if (!organizationId || typeof organizationId !== 'string') {
    return res.status(400).json({ error: 'Organization ID is required' })
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: { in: ['ACTIVE', 'PENDING'] }
      },
      include: {
        entitlements: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return res.status(200).json({ subscription: null })
    }

    return res.status(200).json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
