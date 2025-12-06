import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const { organizationId } = req.body

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Member ID is required' })
  }

  if (req.method === 'DELETE') {
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' })
    }

    try {
      await prisma.userOrganization.delete({
        where: {
          userId_organizationId: {
            userId: id,
            organizationId
          }
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: id,
          orgId: organizationId,
          action: 'member.removed'
        }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete member error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PATCH') {
    const { role } = req.body

    if (!organizationId || !role) {
      return res.status(400).json({ error: 'Organization ID and role are required' })
    }

    try {
      await prisma.userOrganization.update({
        where: {
          userId_organizationId: {
            userId: id,
            organizationId
          }
        },
        data: { role }
      })

      await prisma.auditLog.create({
        data: {
          userId: id,
          orgId: organizationId,
          action: 'member.role_changed',
          metadata: JSON.stringify({ newRole: role })
        }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Update member error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
