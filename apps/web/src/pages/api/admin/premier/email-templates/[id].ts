import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await verifyAuth(req)
  if (!auth || auth.userType !== 'REFORM_STAFF') {
    return res.status(401).json({ error: '認証が必要です' })
  }

  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      await prisma.adminEmailTemplate.delete({
        where: { id: id as string }
      })
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Failed to delete template:', error)
      return res.status(500).json({ error: 'テンプレートの削除に失敗しました' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, subject, body } = req.body

      if (!name || !subject || !body) {
        return res.status(400).json({ error: '名前、件名、本文は必須です' })
      }

      const template = await prisma.adminEmailTemplate.update({
        where: { id: id as string },
        data: { name, subject, body }
      })

      return res.status(200).json({ template })
    } catch (error) {
      console.error('Failed to update template:', error)
      return res.status(500).json({ error: 'テンプレートの更新に失敗しました' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
