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
    // ユーザーの組織を取得
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: auth.userId },
      select: { organizationId: true }
    })

    if (!userOrg) {
      return res.status(200).json({ stats: [] })
    }

    // 組織内のダウンロード履歴を取得
    const downloads = await prisma.databookDownload.findMany({
      where: {
        userId: {
          in: (await prisma.userOrganization.findMany({
            where: { organizationId: userOrg.organizationId },
            select: { userId: true }
          })).map(u => u.userId)
        }
      },
      orderBy: { downloadedAt: 'desc' },
      take: 50
    })

    // ユーザー情報とデータブック情報を取得
    const userIds = [...new Set(downloads.map(d => d.userId))]
    const databookIds = [...new Set(downloads.map(d => d.databookId))]

    const [users, databooks] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true }
      }),
      prisma.databook.findMany({
        where: { id: { in: databookIds } },
        select: { id: true, title: true }
      })
    ])

    const userMap = new Map(users.map(u => [u.id, u]))
    const databookMap = new Map(databooks.map(d => [d.id, d]))

    const stats = downloads.map(download => {
      const user = userMap.get(download.userId)
      const databook = databookMap.get(download.databookId)
      return {
        userId: download.userId,
        userName: user?.name || null,
        email: user?.email || '',
        databookTitle: databook?.title || '不明',
        downloadedAt: download.downloadedAt.toISOString()
      }
    })

    return res.status(200).json({ stats })
  } catch (error) {
    console.error('Failed to fetch download stats:', error)
    return res.status(500).json({ error: 'ダウンロード状況の取得に失敗しました' })
  }
}
