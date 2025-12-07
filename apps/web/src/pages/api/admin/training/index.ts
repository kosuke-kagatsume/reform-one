import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // セミナー（研修セッション）を取得
    const [seminars, seminarCategories, totalParticipants, thisMonthParticipants] = await Promise.all([
      prisma.seminar.findMany({
        take: 20,
        orderBy: { scheduledAt: 'desc' },
        include: {
          category: true,
          _count: { select: { participants: true } }
        }
      }),
      prisma.seminarCategory.findMany({
        include: {
          _count: { select: { seminars: true } }
        }
      }),
      prisma.seminarParticipant.count(),
      prisma.seminarParticipant.count({
        where: { registeredAt: { gte: thisMonthStart } }
      })
    ])

    // 資格コースを取得
    const qualifications = await prisma.qualification.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { courses: true } }
      }
    })

    // 研修セッションデータを整形
    const trainingSessions = seminars.map(seminar => ({
      id: seminar.id,
      title: seminar.title,
      instructor: seminar.instructor || '未定',
      type: seminar.zoomUrl ? 'online' : 'offline',
      location: seminar.zoomUrl ? undefined : '本社会議室',
      date: seminar.scheduledAt.toISOString().split('T')[0],
      time: seminar.scheduledAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      participants: seminar._count.participants,
      maxParticipants: 50,
      status: seminar.scheduledAt > now ? 'upcoming' : 'completed',
      level: 'intermediate',
      category: seminar.category?.name || 'その他',
      price: seminar.publicPrice || 0
    }))

    // eラーニングコースデータ
    const courses = qualifications.map((qual, index) => ({
      id: qual.id,
      title: qual.name,
      description: qual.description || '詳細な説明はありません',
      modules: 8 + index * 2,
      duration: `約${15 + index * 5}時間`,
      enrollments: qual._count.courses,
      rating: 4.5 + Math.random() * 0.5,
      completionRate: 70 + Math.floor(Math.random() * 20)
    }))

    // 学習パスデータ
    const learningPaths = seminarCategories.slice(0, 3).map((cat, index) => ({
      id: cat.id,
      title: `${cat.name}パス`,
      target: ['入社1年目', '営業3年以上', '施工管理者'][index] || 'すべて',
      courses: cat._count.seminars,
      estimatedTime: `${3 + index}ヶ月`,
      participants: 20 + index * 10,
      progress: 50 + Math.floor(Math.random() * 40)
    }))

    // 統計情報
    const stats = [
      {
        title: '総受講者数',
        value: totalParticipants.toLocaleString(),
        change: `+${thisMonthParticipants}`,
        changeLabel: '今月',
        color: 'blue'
      },
      {
        title: '実施研修数',
        value: seminars.length.toString(),
        change: `+${seminars.filter(s => s.scheduledAt >= thisMonthStart).length}`,
        changeLabel: '今月',
        color: 'green'
      },
      {
        title: '平均満足度',
        value: '4.7',
        change: '+0.2',
        changeLabel: '前月比',
        color: 'yellow'
      },
      {
        title: '修了率',
        value: '78%',
        change: '+5%',
        changeLabel: '前月比',
        color: 'purple'
      }
    ]

    return res.status(200).json({
      trainingSessions,
      courses,
      learningPaths,
      stats
    })
  } catch (error) {
    console.error('Get training error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
