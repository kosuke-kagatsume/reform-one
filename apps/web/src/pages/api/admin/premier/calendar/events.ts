import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

interface AdminCalendarEvent {
  id: string
  title: string
  type: 'seminar' | 'site_visit' | 'online_site_visit'
  scheduledAt: Date
  duration?: number | null
  location?: string | null
  description?: string | null
  participantCount: number
  capacity?: number | null
  isPublished?: boolean
  isCanceled?: boolean
  requiredPlan?: string
}

// 管理者用カレンダーイベントAPI
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: '管理者権限が必要です' })
    }

    const { start, end } = req.query

    // 日付範囲のフィルタリング
    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (start) {
      dateFilter.gte = new Date(start as string)
    }
    if (end) {
      dateFilter.lte = new Date(end as string)
    }

    const events: AdminCalendarEvent[] = []

    // セミナーを取得（全件 - 公開・非公開問わず）
    const seminars = await prisma.seminar.findMany({
      where: {
        scheduledAt: dateFilter
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        description: true,
        category: {
          select: { name: true }
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    seminars.forEach(seminar => {
      events.push({
        id: seminar.id,
        title: seminar.title,
        type: 'seminar',
        scheduledAt: seminar.scheduledAt,
        duration: seminar.duration,
        description: seminar.description,
        location: `カテゴリ: ${seminar.category.name}`,
        participantCount: seminar._count.participants
      })
    })

    // 視察会を取得（全件 - キャンセル含む）
    const siteVisits = await prisma.siteVisit.findMany({
      where: {
        scheduledAt: dateFilter
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        location: true,
        description: true,
        capacity: true,
        isPublished: true,
        isCanceled: true,
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    siteVisits.forEach(siteVisit => {
      events.push({
        id: siteVisit.id,
        title: siteVisit.title,
        type: 'site_visit',
        scheduledAt: siteVisit.scheduledAt,
        duration: siteVisit.duration,
        location: siteVisit.location,
        description: siteVisit.description,
        participantCount: siteVisit._count.participants,
        capacity: siteVisit.capacity,
        isPublished: siteVisit.isPublished,
        isCanceled: siteVisit.isCanceled
      })
    })

    // オンライン見学会を取得（全件 - キャンセル含む）
    const onlineSiteVisits = await prisma.onlineSiteVisit.findMany({
      where: {
        scheduledAt: dateFilter
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        location: true,
        description: true,
        capacity: true,
        isPublished: true,
        isCanceled: true,
        requiredPlan: true,
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    onlineSiteVisits.forEach(onlineSiteVisit => {
      events.push({
        id: onlineSiteVisit.id,
        title: onlineSiteVisit.title,
        type: 'online_site_visit',
        scheduledAt: onlineSiteVisit.scheduledAt,
        duration: onlineSiteVisit.duration,
        location: onlineSiteVisit.location,
        description: onlineSiteVisit.description,
        participantCount: onlineSiteVisit._count.participants,
        capacity: onlineSiteVisit.capacity,
        isPublished: onlineSiteVisit.isPublished,
        isCanceled: onlineSiteVisit.isCanceled,
        requiredPlan: onlineSiteVisit.requiredPlan
      })
    })

    // 日付順でソート
    events.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

    return res.status(200).json({ events })
  } catch (error) {
    console.error('Admin calendar events API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
