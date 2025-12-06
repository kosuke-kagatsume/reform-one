import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if qualification exists
    const qualification = await prisma.qualification.findUnique({
      where: { id },
    })

    if (!qualification || !qualification.isActive) {
      return res.status(404).json({ error: 'Qualification not found' })
    }

    // Check if already enrolled
    const existing = await prisma.userQualification.findUnique({
      where: {
        userId_qualificationId: {
          userId: auth.userId,
          qualificationId: id,
        },
      },
    })

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled' })
    }

    // Get user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: auth.userId },
    })

    // Create enrollment
    const enrollment = await prisma.userQualification.create({
      data: {
        userId: auth.userId,
        qualificationId: id,
        organizationId: userOrg?.organizationId,
        status: 'ENROLLED',
      },
    })

    return res.status(201).json(enrollment)
  } catch (error) {
    console.error('Enroll qualification error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
