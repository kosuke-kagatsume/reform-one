import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  // Get user from request (in production, this should come from session)
  const userId = req.headers['x-user-id'] as string
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    // Check if user is registered
    try {
      const participant = await prisma.seminarParticipant.findUnique({
        where: {
          seminarId_userId: {
            seminarId: id,
            userId
          }
        }
      })

      return res.status(200).json({ registered: !!participant })
    } catch (error) {
      console.error('Check registration error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Register for seminar
    try {
      // Check if seminar exists and is in the future
      const seminar = await prisma.seminar.findUnique({
        where: { id }
      })

      if (!seminar) {
        return res.status(404).json({ error: 'Seminar not found' })
      }

      if (new Date(seminar.scheduledAt) < new Date()) {
        return res.status(400).json({ error: 'Cannot register for past seminars' })
      }

      // Check if already registered
      const existing = await prisma.seminarParticipant.findUnique({
        where: {
          seminarId_userId: {
            seminarId: id,
            userId
          }
        }
      })

      if (existing) {
        return res.status(400).json({ error: 'Already registered' })
      }

      const participant = await prisma.seminarParticipant.create({
        data: {
          seminarId: id,
          userId
        }
      })

      return res.status(201).json({ participant })
    } catch (error) {
      console.error('Register seminar error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    // Cancel registration
    try {
      await prisma.seminarParticipant.delete({
        where: {
          seminarId_userId: {
            seminarId: id,
            userId
          }
        }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Cancel registration error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
