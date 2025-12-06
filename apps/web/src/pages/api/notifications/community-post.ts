import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { sendMail, getCommunityPostEmailHtml, getCommunityPostEmailText } from '@/lib/mail'

// Send community post notification to Expert plan users
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { postId, categoryName, postTitle, authorName, categorySlug } = req.body

  if (!postId || !categoryName || !postTitle) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Get all Expert plan subscriptions that are active
    const expertSubscriptions = await prisma.subscription.findMany({
      where: {
        planType: 'EXPERT',
        status: 'ACTIVE'
      },
      include: {
        organization: {
          include: {
            users: {
              include: {
                user: {
                  select: {
                    email: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Collect all expert user emails
    const expertEmails: string[] = []
    for (const subscription of expertSubscriptions) {
      for (const userOrg of subscription.organization.users) {
        if (userOrg.user.email) {
          expertEmails.push(userOrg.user.email)
        }
      }
    }

    if (expertEmails.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No expert users to notify' })
    }

    // Build post URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const postUrl = baseUrl + '/dashboard/community/' + (categorySlug || '')

    // Send email to all expert users
    const html = getCommunityPostEmailHtml({
      categoryName,
      postTitle,
      authorName: authorName || 'Unknown',
      postUrl
    })

    const text = getCommunityPostEmailText({
      categoryName,
      postTitle,
      authorName: authorName || 'Unknown',
      postUrl
    })

    // Send emails in batches to avoid overwhelming the mail server
    const batchSize = 50
    let sentCount = 0

    for (let i = 0; i < expertEmails.length; i += batchSize) {
      const batch = expertEmails.slice(i, i + batchSize)
      const success = await sendMail({
        to: batch,
        subject: `【コミュニティ】${categoryName}に新しい投稿: ${postTitle}`,
        text,
        html
      })
      if (success) {
        sentCount += batch.length
      }
    }

    return res.status(200).json({
      sent: sentCount,
      total: expertEmails.length
    })
  } catch (error) {
    console.error('Community post notification error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
