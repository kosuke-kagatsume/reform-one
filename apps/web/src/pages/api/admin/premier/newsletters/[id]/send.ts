import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail'

// Send newsletter to all Expert plan users
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid newsletter ID' })
  }

  try {
    // Get the newsletter
    const newsletter = await prisma.newsletter.findUnique({
      where: { id }
    })

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' })
    }

    if (newsletter.sentAt) {
      return res.status(400).json({ error: 'このニュースレターは既に送信済みです' })
    }

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

    // Send emails in batches
    const batchSize = 50
    let sentCount = 0

    for (let i = 0; i < expertEmails.length; i += batchSize) {
      const batch = expertEmails.slice(i, i + batchSize)
      const success = await sendMail({
        to: batch,
        subject: `【プレミア購読】${newsletter.title}`,
        text: newsletter.summary || newsletter.content.replace(/<[^>]*>/g, '').substring(0, 500),
        html: getNewsletterEmailHtml(newsletter.title, newsletter.content)
      })
      if (success) {
        sentCount += batch.length
      }
    }

    // Mark as sent
    await prisma.newsletter.update({
      where: { id },
      data: {
        sentAt: new Date(),
        isPublished: true
      }
    })

    return res.status(200).json({
      sent: sentCount,
      total: expertEmails.length
    })
  } catch (error) {
    console.error('Send newsletter error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getNewsletterEmailHtml(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.8; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; background: #fff; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9fafb; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>プレミア購読 ニュースレター</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>このメールはプレミア購読システムから自動送信されています。</p>
      <p>リフォーム産業新聞社</p>
    </div>
  </div>
</body>
</html>
  `
}
