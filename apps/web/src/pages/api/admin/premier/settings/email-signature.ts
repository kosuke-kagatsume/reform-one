import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdminPermission } from '@/lib/admin-auth'

const SIGNATURE_KEY = 'email_signature'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { authorized, error } = await requireAdminPermission(req, 'VIEW')
    if (!authorized) return res.status(403).json({ error })

    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: SIGNATURE_KEY }
      })

      return res.status(200).json({
        signature: setting?.value || ''
      })
    } catch (error) {
      console.error('Get email signature error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const { authorized, user, error } = await requireAdminPermission(req, 'EDIT')
    if (!authorized) return res.status(403).json({ error })

    const { signature } = req.body

    try {
      await prisma.systemSetting.upsert({
        where: { key: SIGNATURE_KEY },
        update: {
          value: signature || '',
          updatedBy: user.id
        },
        create: {
          key: SIGNATURE_KEY,
          value: signature || '',
          updatedBy: user.id
        }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Update email signature error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
