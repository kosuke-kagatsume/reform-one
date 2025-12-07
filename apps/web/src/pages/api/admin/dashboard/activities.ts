import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // すべてのクエリを並列実行（4クエリ→1回の並列実行）
    const [recentCustomers, recentSubscriptions, recentArchives] = await Promise.all([
      // 最近の新規顧客
      prisma.organization.findMany({
        where: { type: 'CUSTOMER' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      }),
      // 最近のサブスクリプション変更
      prisma.subscription.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          organization: { select: { name: true } }
        }
      }),
      // 最近のアーカイブ（コンテンツ）
      prisma.archive.findMany({
        where: { publishedAt: { lte: new Date() } },
        take: 3,
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, publishedAt: true }
      })
    ])

    // アクティビティを統合してフォーマット
    const activities: Array<{
      id: string
      type: string
      title: string
      description: string
      time: string
      status: string
    }> = []

    // 新規顧客をアクティビティに追加
    recentCustomers.forEach(customer => {
      activities.push({
        id: `customer-${customer.id}`,
        type: 'new_customer',
        title: '新規顧客登録',
        description: `${customer.name}が新規登録しました`,
        time: formatTimeAgo(customer.createdAt),
        status: 'success'
      })
    })

    // サブスクリプション変更をアクティビティに追加
    recentSubscriptions.forEach(sub => {
      const statusMap: Record<string, { title: string; status: string }> = {
        'ACTIVE': { title: 'サブスクリプション開始', status: 'success' },
        'SUSPENDED': { title: 'サブスクリプション一時停止', status: 'warning' },
        'CANCELLED': { title: 'サブスクリプション解約', status: 'warning' },
        'PENDING': { title: 'サブスクリプション申請', status: 'info' }
      }
      const info = statusMap[sub.status] || { title: 'プラン変更', status: 'info' }
      activities.push({
        id: `sub-${sub.id}`,
        type: 'subscription',
        title: info.title,
        description: `${sub.organization.name}が${sub.planType}プラン`,
        time: formatTimeAgo(sub.updatedAt),
        status: info.status
      })
    })

    // コンテンツ公開をアクティビティに追加
    recentArchives.forEach(archive => {
      activities.push({
        id: `archive-${archive.id}`,
        type: 'content',
        title: '記事公開',
        description: `「${archive.title}」が公開されました`,
        time: formatTimeAgo(archive.publishedAt),
        status: 'success'
      })
    })

    // 時間順にソート
    activities.sort((a, b) => {
      return parseTimeAgo(b.time) - parseTimeAgo(a.time)
    })

    // 2分キャッシュ - アクティビティは準リアルタイムで十分
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240')
    return res.status(200).json({ activities: activities.slice(0, 8) })
  } catch (error) {
    console.error('Get dashboard activities error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`
  return date.toLocaleDateString('ja-JP')
}

function parseTimeAgo(timeStr: string): number {
  // 簡易的なパース（ソート用）
  if (timeStr.includes('分前')) return parseInt(timeStr) || 0
  if (timeStr.includes('時間前')) return (parseInt(timeStr) || 0) * 60
  if (timeStr.includes('日前')) return (parseInt(timeStr) || 0) * 1440
  return 999999 // 古い日付
}
