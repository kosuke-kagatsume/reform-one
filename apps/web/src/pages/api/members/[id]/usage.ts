import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get member basic info with organization membership
    const userWithOrg = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        organizations: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true
              }
            }
          },
          take: 1
        }
      }
    })

    if (!userWithOrg) {
      return res.status(404).json({ error: 'Member not found' })
    }

    const orgMembership = userWithOrg.organizations[0]
    const member = {
      id: userWithOrg.id,
      name: userWithOrg.name,
      email: userWithOrg.email,
      role: orgMembership?.role || 'MEMBER',
      createdAt: userWithOrg.createdAt,
      organization: orgMembership?.organization || null
    }

    // Get seminar participation history
    const seminarParticipations = await prisma.seminarParticipant.findMany({
      where: { userId: id },
      include: {
        seminar: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    })

    // Get archive view history
    const archiveViews = await prisma.archiveView.findMany({
      where: { userId: id },
      include: {
        archive: {
          select: {
            id: true,
            title: true,
            publishedAt: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { viewedAt: 'desc' }
    })

    // Get community post history
    const communityPosts = await prisma.communityPost.findMany({
      where: { authorId: id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Aggregate statistics
    const stats = {
      totalSeminarParticipations: seminarParticipations.length,
      totalArchiveViews: archiveViews.length,
      totalCommunityPosts: communityPosts.length,
      lastActivity: getLastActivity(seminarParticipations, archiveViews, communityPosts)
    }

    return res.status(200).json({
      member,
      seminarParticipations: seminarParticipations.map(p => ({
        id: p.id,
        registeredAt: p.registeredAt,
        seminar: p.seminar
      })),
      archiveViews: archiveViews.map(v => ({
        id: v.id,
        viewedAt: v.viewedAt,
        archive: v.archive
      })),
      communityPosts: communityPosts.map(p => ({
        id: p.id,
        title: p.title,
        createdAt: p.createdAt,
        category: p.category
      })),
      stats
    })
  } catch (error) {
    console.error('Get member usage error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getLastActivity(
  seminars: { registeredAt: Date }[],
  archives: { viewedAt: Date }[],
  posts: { createdAt: Date }[]
): Date | null {
  const dates = [
    ...seminars.map(s => s.registeredAt),
    ...archives.map(a => a.viewedAt),
    ...posts.map(p => p.createdAt)
  ]

  if (dates.length === 0) return null

  return dates.reduce((latest, date) =>
    date > latest ? date : latest
  )
}
