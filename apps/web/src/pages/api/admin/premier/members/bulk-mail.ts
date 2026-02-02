import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail'
import { getAdminUser } from '@/lib/admin-auth'

const SIGNATURE_KEY = 'email_signature'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const adminUser = await getAdminUser(req)

  try {
    const { recipientIds, subject, body } = req.body

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ error: '送信先が指定されていません' })
    }

    if (!subject || !body) {
      return res.status(400).json({ error: '件名と本文を入力してください' })
    }

    let signature = ''
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: SIGNATURE_KEY }
      })
      signature = setting?.value || ''
    } catch {}

    const recipients = await prisma.user.findMany({
      where: {
        id: { in: recipientIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        organizations: {
          select: {
            organization: {
              select: {
                name: true
              }
            }
          },
          take: 1
        }
      }
    })

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const orgName = recipient.organizations[0]?.organization?.name || ''
        const personalizedBody = body
          .replace(/\{\{name\}\}/g, recipient.name || 'お客様')
          .replace(/\{\{organization\}\}/g, orgName)

        const fullBody = signature ? `${personalizedBody}\n\n${signature}` : personalizedBody

        await sendMail({
          to: recipient.email,
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Reform One</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">プレミア購読</p>
              </div>
              <div style="padding: 30px; background: #fff;">
                ${fullBody.split('\n').map((line: string) => `<p style="margin: 0 0 16px; line-height: 1.8;">${line}</p>`).join('')}
              </div>
              <div style="padding: 20px; background: #f8fafc; text-align: center; font-size: 12px; color: #64748b;">
                <p>このメールはリフォーム産業新聞社から送信されています。</p>
              </div>
            </div>
          `,
          text: fullBody
        })

        if (adminUser) {
          await prisma.emailHistory.create({
            data: {
              templateType: 'BULK_MAIL',
              recipientEmail: recipient.email,
              recipientName: recipient.name,
              recipientType: 'USER',
              recipientId: recipient.id,
              subject,
              body: fullBody,
              status: 'SENT',
              sentById: adminUser.id
            }
          })
        }

        return recipient.id
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    await prisma.activityLog.create({
      data: {
        activityType: 'BULK_EMAIL_SENT',
        resourceType: 'email',
        metadata: JSON.stringify({
          subject,
          recipientCount: recipients.length,
          successful,
          failed
        }),
        userId: adminUser?.id || recipientIds[0]
      }
    })

    res.status(200).json({
      success: true,
      sent: successful,
      failed
    })
  } catch (error) {
    console.error('Failed to send bulk mail:', error)
    res.status(500).json({ error: 'メールの送信に失敗しました' })
  }
}
