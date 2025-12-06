import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (req.method === 'GET') {
      const qualifications = await prisma.qualification.findMany({
        include: {
          _count: {
            select: { courses: true },
          },
        },
        orderBy: { name: 'asc' },
      })

      const result = qualifications.map((q) => ({
        ...q,
        enrollmentCount: q._count.courses,
      }))

      return res.status(200).json(result)
    }

    if (req.method === 'POST') {
      const { name, code, description, isActive } = req.body

      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required' })
      }

      const qualification = await prisma.qualification.create({
        data: {
          name,
          code,
          description,
          isActive: isActive ?? true,
        },
      })

      return res.status(201).json(qualification)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin qualifications error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
