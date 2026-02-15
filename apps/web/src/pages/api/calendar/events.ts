import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

interface CalendarEvent {
  id: string
  title: string
  type: 'seminar' | 'site_visit' | 'online_site_visit'
  scheduledAt: Date
  duration?: number | null
  location?: string | null
  description?: string | null
  isRegistered: boolean
  requiredPlan?: string
}

// A-5: カレンダー表示用イベントAPI
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
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

    // ユーザーの登録情報を取得
    const userRegistrations = {
      seminars: new Set<string>(),
      siteVisits: new Set<string>(),
      onlineSiteVisits: new Set<string>()
    }

    // セミナー参加登録
    const seminarParticipations = await prisma.seminarParticipant.findMany({
      where: { userId: auth.userId },
      select: { seminarId: true }
    })
    seminarParticipations.forEach(p => userRegistrations.seminars.add(p.seminarId))

    // 視察会参加登録
    const siteVisitParticipations = await prisma.siteVisitParticipant.findMany({
      where: { userId: auth.userId },
      select: { siteVisitId: true }
    })
    siteVisitParticipations.forEach(p => userRegistrations.siteVisits.add(p.siteVisitId))

    // オンライン見学会参加登録
    const onlineSiteVisitParticipations = await prisma.onlineSiteVisitParticipant.findMany({
      where: { userId: auth.userId },
      select: { onlineSiteVisitId: true }
    })
    onlineSiteVisitParticipations.forEach(p => userRegistrations.onlineSiteVisits.add(p.onlineSiteVisitId))

    const events: CalendarEvent[] = []

    // セミナーを取得
    const seminars = await prisma.seminar.findMany({
      where: {
        scheduledAt: dateFilter,
        // isPublic でなくても会員には表示
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        description: true,
        category: {
          select: { name: true }
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
        isRegistered: userRegistrations.seminars.has(seminar.id)
      })
    })

    // 視察会を取得
    const siteVisits = await prisma.siteVisit.findMany({
      where: {
        scheduledAt: dateFilter,
        isPublished: true,
        isCanceled: false
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        location: true,
        description: true
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
        isRegistered: userRegistrations.siteVisits.has(siteVisit.id)
      })
    })

    // オンライン見学会を取得
    const onlineSiteVisits = await prisma.onlineSiteVisit.findMany({
      where: {
        scheduledAt: dateFilter,
        isPublished: true,
        isCanceled: false
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        location: true,
        description: true,
        requiredPlan: true
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
        isRegistered: userRegistrations.onlineSiteVisits.has(onlineSiteVisit.id),
        requiredPlan: onlineSiteVisit.requiredPlan
      })
    })

    // 日付順でソート
    events.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

    return success(res, { events })
  } catch (err) {
    console.error('Calendar events API error:', err)
    return internalError(res)
  }
}
