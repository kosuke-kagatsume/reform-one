import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Parse cookies from request
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key && value) acc[key] = value
    return acc
  }, {} as Record<string, string>)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Authenticate admin user
  const cookies = parseCookies(req.headers.cookie)
  const sessionUserId = cookies['premier_session']

  if (!sessionUserId) {
    return res.status(401).json({ error: '認証が必要です' })
  }

  // Verify user exists and is an admin (Reform Company)
  const adminUser = await prisma.user.findUnique({
    where: { id: sessionUserId },
    include: {
      organizations: {
        include: {
          organization: {
            select: { type: true }
          }
        }
      }
    }
  })

  if (!adminUser) {
    return res.status(401).json({ error: 'ユーザーが見つかりません' })
  }

  const isReformCompany = adminUser.organizations.some(
    org => org.organization.type === 'REFORM_COMPANY'
  )

  if (!isReformCompany) {
    return res.status(403).json({ error: '管理者権限が必要です' })
  }

  const { recipientId, recipientType, limit = '50', offset = '0' } = req.query

  // Validate and parse limit/offset
  const parsedLimit = Math.min(Math.max(parseInt(limit as string) || 50, 1), 100)
  const parsedOffset = Math.max(parseInt(offset as string) || 0, 0)

  try {
    const where: Record<string, unknown> = {}

    if (recipientId && typeof recipientId === 'string') {
      where.recipientId = recipientId
    }

    if (recipientType && typeof recipientType === 'string') {
      // Validate recipientType
      if (recipientType !== 'USER' && recipientType !== 'ORGANIZATION') {
        return res.status(400).json({ error: 'Invalid recipient type' })
      }
      where.recipientType = recipientType
    }

    const [history, total] = await Promise.all([
      prisma.emailHistory.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        take: parsedLimit,
        skip: parsedOffset,
        select: {
          id: true,
          templateType: true,
          recipientEmail: true,
          recipientName: true,
          recipientType: true,
          recipientId: true,
          subject: true,
          status: true,
          sentAt: true,
          metadata: true
        }
      }),
      prisma.emailHistory.count({ where })
    ])

    // Parse metadata for each history item with error handling
    const historyWithParsedMetadata = history.map(item => {
      let parsedMetadata = null
      if (item.metadata) {
        try {
          parsedMetadata = JSON.parse(item.metadata)
        } catch {
          // Keep as null if parsing fails
          console.error('Failed to parse email history metadata:', item.id)
        }
      }
      return {
        ...item,
        metadata: parsedMetadata
      }
    })

    return res.status(200).json({
      history: historyWithParsedMetadata,
      total,
      limit: parsedLimit,
      offset: parsedOffset
    })
  } catch (error) {
    console.error('Get email history error:', error)
    return res.status(500).json({ error: 'Failed to get email history' })
  }
}
