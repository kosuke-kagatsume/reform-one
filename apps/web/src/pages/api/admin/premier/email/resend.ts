import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import {
  sendMail,
  getAdminContactEmailHtml,
  getAdminContactEmailText,
  getAdminRenewalNoticeEmailHtml,
  getAdminRenewalNoticeEmailText,
  getSeminarNotificationEmailHtml,
  getSeminarNotificationEmailText,
  getSiteVisitNotificationEmailHtml,
  getSiteVisitNotificationEmailText,
  getOnlineSiteVisitNotificationEmailHtml,
  getOnlineSiteVisitNotificationEmailText,
} from '@/lib/mail'

// C-3: メール再送API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.userType !== 'EMPLOYEE') {
      return res.status(403).json({ error: '管理者権限が必要です' })
    }

    const { historyId } = req.body

    if (!historyId) {
      return res.status(400).json({ error: '履歴IDが必要です' })
    }

    // 元のメール履歴を取得
    const originalEmail = await prisma.emailHistory.findUnique({
      where: { id: historyId }
    })

    if (!originalEmail) {
      return res.status(404).json({ error: 'メール履歴が見つかりません' })
    }

    // メタデータをパース
    let metadata: Record<string, unknown> = {}
    try {
      metadata = originalEmail.metadata ? JSON.parse(originalEmail.metadata) : {}
    } catch {
      metadata = {}
    }

    // テンプレートタイプに応じてメール内容を再生成
    let html: string = ''
    let text: string = ''
    const recipientName = originalEmail.recipientName || '会員'
    const organizationName = (metadata.organizationName as string) || ''

    switch (originalEmail.templateType) {
      case 'CONTACT': {
        html = getAdminContactEmailHtml({
          recipientName,
          organizationName,
          subject: originalEmail.subject,
          message: originalEmail.body || '',
          senderName: 'プレミア購読運営事務局'
        })
        text = getAdminContactEmailText({
          recipientName,
          organizationName,
          subject: originalEmail.subject,
          message: originalEmail.body || '',
          senderName: 'プレミア購読運営事務局'
        })
        break
      }
      case 'RENEWAL_NOTICE': {
        const planType = (metadata.planType as string) || 'STANDARD'
        const daysRemaining = (metadata.daysRemaining as number) || 0
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + daysRemaining)

        html = getAdminRenewalNoticeEmailHtml({
          organizationName,
          recipientName,
          planType,
          expiresAt,
          daysRemaining,
          contactInfo: '更新手続きについては、このメールに返信してお問い合わせください。'
        })
        text = getAdminRenewalNoticeEmailText({
          organizationName,
          recipientName,
          planType,
          expiresAt,
          daysRemaining,
          contactInfo: '更新手続きについては、このメールに返信してお問い合わせください。'
        })
        break
      }
      case 'SEMINAR_NOTIFICATION': {
        const seminarData = metadata.seminar as Record<string, unknown> | undefined
        if (seminarData) {
          html = getSeminarNotificationEmailHtml({
            seminarTitle: (seminarData.title as string) || originalEmail.subject,
            scheduledAt: new Date((seminarData.scheduledAt as string) || Date.now()),
            speakerName: (seminarData.speakerName as string) || '',
            description: (seminarData.description as string) || '',
            zoomUrl: (seminarData.zoomUrl as string) || '',
            category: (seminarData.category as string) || 'セミナー'
          })
          text = getSeminarNotificationEmailText({
            seminarTitle: (seminarData.title as string) || originalEmail.subject,
            scheduledAt: new Date((seminarData.scheduledAt as string) || Date.now()),
            speakerName: (seminarData.speakerName as string) || '',
            description: (seminarData.description as string) || '',
            zoomUrl: (seminarData.zoomUrl as string) || '',
            category: (seminarData.category as string) || 'セミナー'
          })
        }
        break
      }
      case 'SITE_VISIT_NOTIFICATION': {
        const siteVisitData = metadata.siteVisit as Record<string, unknown> | undefined
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://premium.the-reform.co.jp'
        if (siteVisitData) {
          html = getSiteVisitNotificationEmailHtml({
            title: (siteVisitData.title as string) || originalEmail.subject,
            companyName: siteVisitData.companyName as string | undefined,
            location: (siteVisitData.location as string) || '',
            scheduledAt: new Date((siteVisitData.scheduledAt as string) || Date.now()),
            description: siteVisitData.description as string | undefined,
            capacity: siteVisitData.capacity as number | undefined,
            dashboardUrl: `${baseUrl}/dashboard/site-visits`
          })
          text = getSiteVisitNotificationEmailText({
            title: (siteVisitData.title as string) || originalEmail.subject,
            companyName: siteVisitData.companyName as string | undefined,
            location: (siteVisitData.location as string) || '',
            scheduledAt: new Date((siteVisitData.scheduledAt as string) || Date.now()),
            description: siteVisitData.description as string | undefined,
            capacity: siteVisitData.capacity as number | undefined,
            dashboardUrl: `${baseUrl}/dashboard/site-visits`
          })
        }
        break
      }
      case 'ONLINE_SITE_VISIT_NOTIFICATION': {
        const onlineSiteVisitData = metadata.onlineSiteVisit as Record<string, unknown> | undefined
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://premium.the-reform.co.jp'
        if (onlineSiteVisitData) {
          html = getOnlineSiteVisitNotificationEmailHtml({
            title: (onlineSiteVisitData.title as string) || originalEmail.subject,
            companyName: onlineSiteVisitData.companyName as string | undefined,
            location: onlineSiteVisitData.location as string | undefined,
            scheduledAt: new Date((onlineSiteVisitData.scheduledAt as string) || Date.now()),
            description: onlineSiteVisitData.description as string | undefined,
            dashboardUrl: `${baseUrl}/dashboard/online-site-visits`
          })
          text = getOnlineSiteVisitNotificationEmailText({
            title: (onlineSiteVisitData.title as string) || originalEmail.subject,
            companyName: onlineSiteVisitData.companyName as string | undefined,
            location: onlineSiteVisitData.location as string | undefined,
            scheduledAt: new Date((onlineSiteVisitData.scheduledAt as string) || Date.now()),
            description: onlineSiteVisitData.description as string | undefined,
            dashboardUrl: `${baseUrl}/dashboard/online-site-visits`
          })
        }
        break
      }
      default: {
        // 汎用的な再送: 元のbodyをそのまま使用
        text = originalEmail.body || ''
        html = `<div style="font-family: sans-serif; line-height: 1.6;">${text.replace(/\n/g, '<br>')}</div>`
      }
    }

    // メール送信
    const success = await sendMail({
      to: originalEmail.recipientEmail,
      subject: `【再送】${originalEmail.subject}`,
      html,
      text
    })

    // 新しい履歴を作成
    await prisma.emailHistory.create({
      data: {
        templateType: originalEmail.templateType,
        recipientEmail: originalEmail.recipientEmail,
        recipientName: originalEmail.recipientName,
        recipientType: originalEmail.recipientType,
        recipientId: originalEmail.recipientId,
        subject: `【再送】${originalEmail.subject}`,
        body: text,
        status: success ? 'SENT' : 'FAILED',
        sentById: auth.userId,
        metadata: JSON.stringify({
          ...metadata,
          resendOf: historyId,
          resendAt: new Date().toISOString()
        })
      }
    })

    if (success) {
      return res.status(200).json({ success: true, message: 'メールを再送しました' })
    } else {
      return res.status(500).json({ error: 'メールの再送に失敗しました' })
    }
  } catch (error) {
    console.error('Email resend error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
