import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'ADMIN' || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { id, participantId } = req.query

    if (typeof id !== 'string' || typeof participantId !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' })
    }

    if (req.method === 'GET') {
      const participant = await prisma.siteVisitParticipant.findFirst({
        where: {
          id: participantId,
          siteVisitId: id
        },
      })

      if (!participant) {
        return res.status(404).json({ error: 'Participant not found' })
      }

      return res.status(200).json(participant)
    }

    if (req.method === 'PUT') {
      const {
        status,
        paymentStatus,
        joinAfterParty,
        afterPartyPaymentStatus,
      } = req.body

      const updateData: Record<string, unknown> = {}

      if (status !== undefined) {
        updateData.status = status
      }
      if (paymentStatus !== undefined) {
        updateData.paymentStatus = paymentStatus
      }
      if (joinAfterParty !== undefined) {
        updateData.joinAfterParty = joinAfterParty
      }
      if (afterPartyPaymentStatus !== undefined) {
        updateData.afterPartyPaymentStatus = afterPartyPaymentStatus
      }

      const participant = await prisma.siteVisitParticipant.update({
        where: { id: participantId },
        data: updateData,
      })

      return res.status(200).json(participant)
    }

    if (req.method === 'DELETE') {
      await prisma.siteVisitParticipant.delete({
        where: { id: participantId },
      })

      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin site visit participant error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
