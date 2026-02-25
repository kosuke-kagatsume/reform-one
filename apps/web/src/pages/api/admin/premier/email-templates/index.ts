import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await verifyAuth(req)
  if (!auth || auth.userType !== 'REFORM_STAFF') {
    return res.status(401).json({ error: '認証が必要です' })
  }

  if (req.method === 'GET') {
    try {
      const templates = await prisma.adminEmailTemplate.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return res.status(200).json({ templates })
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      return res.status(500).json({ error: 'テンプレートの取得に失敗しました' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, subject, body } = req.body

      if (!name || !subject || !body) {
        return res.status(400).json({ error: '名前、件名、本文は必須です' })
      }

      // 入力長の制限（DoS対策）
      const MAX_NAME_LENGTH = 100
      const MAX_SUBJECT_LENGTH = 200
      const MAX_BODY_LENGTH = 50000

      if (name.length > MAX_NAME_LENGTH) {
        return res.status(400).json({ error: `名前は${MAX_NAME_LENGTH}文字以内で入力してください` })
      }
      if (subject.length > MAX_SUBJECT_LENGTH) {
        return res.status(400).json({ error: `件名は${MAX_SUBJECT_LENGTH}文字以内で入力してください` })
      }
      if (body.length > MAX_BODY_LENGTH) {
        return res.status(400).json({ error: `本文は${MAX_BODY_LENGTH}文字以内で入力してください` })
      }

      const template = await prisma.adminEmailTemplate.create({
        data: {
          name,
          subject,
          body,
          createdById: auth.userId
        }
      })

      return res.status(201).json({ template })
    } catch (error) {
      console.error('Failed to create template:', error)
      return res.status(500).json({ error: 'テンプレートの作成に失敗しました' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
