import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { organizationId, search, role, status, page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // 組織のユーザーを取得
    const where: any = {}

    if (organizationId) {
      where.organizationId = organizationId as string
    }

    if (role && role !== 'all') {
      where.role = role as string
    }

    // 5クエリ→3クエリに最適化（重複クエリ削除）
    const [userOrgs, total, adminCount, pendingInvites] = await Promise.all([
      prisma.userOrganization.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              emailVerified: true,
              createdAt: true,
              updatedAt: true
            }
          },
          department: {
            select: { name: true }
          },
          organization: {
            select: {
              id: true,
              name: true,
              settings: {
                select: { seatLimit: true }
              }
            }
          }
        },
        orderBy: { joinedAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.userOrganization.count({ where }),
      prisma.userOrganization.count({ where: { ...where, role: 'ADMIN' } }),
      prisma.invitation.count({
        where: {
          ...(organizationId ? { organizationId: organizationId as string } : {}),
          acceptedAt: null,
          expiresAt: { gt: new Date() }
        }
      })
    ])

    // ユーザーデータを整形
    const users = userOrgs.map(uo => {
      const lastActive = uo.user.updatedAt
      const now = new Date()
      const diffMs = now.getTime() - lastActive.getTime()
      const diffDays = Math.floor(diffMs / 86400000)

      let status = 'active'
      let lastActiveStr = ''

      if (diffDays > 30) {
        status = 'inactive'
        lastActiveStr = `${diffDays}日前`
      } else if (diffDays > 7) {
        lastActiveStr = `${Math.floor(diffDays / 7)}週間前`
      } else if (diffDays > 0) {
        lastActiveStr = `${diffDays}日前`
      } else {
        const diffHours = Math.floor(diffMs / 3600000)
        if (diffHours > 0) {
          lastActiveStr = `${diffHours}時間前`
        } else {
          const diffMins = Math.floor(diffMs / 60000)
          lastActiveStr = diffMins > 0 ? `${diffMins}分前` : 'たった今'
        }
      }

      if (!uo.user.emailVerified) {
        status = 'pending'
        lastActiveStr = '未ログイン'
      }

      return {
        id: uo.user.id,
        name: uo.user.name || 'ユーザー',
        email: uo.user.email,
        role: uo.role,
        status,
        department: uo.department?.name || '未設定',
        lastActive: lastActiveStr,
        joinedDate: uo.joinedAt.toISOString().split('T')[0],
        avatar: null
      }
    })

    // 統計情報（activeUsersはtotalと同じなので再利用）
    const seatLimit = userOrgs[0]?.organization?.settings?.seatLimit || 50
    const stats = {
      totalUsers: total,
      seatLimit,
      activeUsers: total, // 重複クエリ削除のため再利用
      pendingInvites,
      adminCount
    }

    // 2分キャッシュ - ユーザーリストはリアルタイム性は不要
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240')
    return res.status(200).json({
      users,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
