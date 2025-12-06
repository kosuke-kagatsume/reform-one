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

      // Get all active qualifications with user's enrollment status
      const qualifications = await prisma.qualification.findMany({
        where: { isActive: true },
        include: {
          courses: {
            where: { userId: auth.userId },
            select: {
              id: true,
              status: true,
              enrolledAt: true,
              completedAt: true,
              expiresAt: true,
              certificateUrl: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      })

      const result = qualifications.map((q) => ({
        id: q.id,
        name: q.name,
        code: q.code,
        description: q.description,
        isEnrolled: q.courses.length > 0,
        enrollment: q.courses[0] || null,
      }))

      return res.status(200).json(result)
    } catch (error) {
      console.error('Get qualifications error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Admin only: Create qualification
    try {
      const auth = await verifyAuth(req)
      if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const { name, code, description } = req.body

      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required' })
      }

      const qualification = await prisma.qualification.create({
        data: {
          name,
          code,
          description,
        },
      })

      return res.status(201).json(qualification)
    } catch (error) {
      console.error('Create qualification error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
