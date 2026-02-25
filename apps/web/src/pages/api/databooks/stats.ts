import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyAuth(req)
  if (!auth) {
    return res.status(401).json({ error: '認証が必要です' })
  }

  try {
    // データブック数を取得
    const totalDatabooks = await prisma.databook.count({
      where: { isPublished: true }
    })

    // ダウンロード数を取得
    const totalDownloads = await prisma.databookDownload.count()

    // 最新のデータブック
    const latestDatabook = await prisma.databook.findFirst({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        publishedAt: true
      }
    })

    return res.status(200).json({
      totalDatabooks,
      totalDownloads,
      latestDatabook
    })
  } catch (error) {
    console.error('Failed to fetch databooks stats:', error)
    return res.status(500).json({ error: '統計の取得に失敗しました' })
  }
}
