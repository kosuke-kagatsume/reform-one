import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

const SETTING_KEY = 'community_guidelines'

const DEFAULT_GUIDELINES = `・ 各コミュニティでは月1回の定例Zoomミーティングを開催します
・ 「URL設定」ボタンから各コミュニティのZoom登録ページURLを設定できます
・ 定例会の録画はYouTube限定公開URLで保存し、アーカイブとして登録します
・ エキスパートプラン会員のみがコミュニティにアクセスできます`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await verifyAuth(req)
  if (!auth) {
    return res.status(401).json({ error: '認証が必要です' })
  }

  // GET: 設定を取得
  if (req.method === 'GET') {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: SETTING_KEY }
      })

      return res.status(200).json({
        content: setting?.value || DEFAULT_GUIDELINES
      })
    } catch (error) {
      console.error('Failed to fetch community guidelines:', error)
      return res.status(500).json({ error: '設定の取得に失敗しました' })
    }
  }

  // PUT: 設定を更新
  if (req.method === 'PUT') {
    const { content } = req.body

    if (typeof content !== 'string') {
      return res.status(400).json({ error: '内容を入力してください' })
    }

    try {
      await prisma.systemSetting.upsert({
        where: { key: SETTING_KEY },
        update: {
          value: content,
          updatedBy: auth.userId
        },
        create: {
          key: SETTING_KEY,
          value: content,
          updatedBy: auth.userId
        }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Failed to update community guidelines:', error)
      return res.status(500).json({ error: '設定の更新に失敗しました' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
