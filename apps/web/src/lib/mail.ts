// Mail utility for Premier Subscription using Resend
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'プレミア購読運営事務局 <premium@the-reform.co.jp>'
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@reform-one.jp'

interface SendMailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
}

export async function sendMail({ to, subject, text, html }: SendMailOptions): Promise<boolean> {
  const recipients = Array.isArray(to) ? to : [to]

  // In development without API key, just log the email
  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === 'development') {
    console.log('📧 [Mail] Would send email:')
    console.log(`   From: ${FROM_EMAIL}`)
    console.log(`   To: ${recipients.join(', ')}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Body: ${text?.substring(0, 100)}...`)
    return true
  }

  try {
    // Use type assertion for Resend API compatibility
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      replyTo: REPLY_TO,
      subject,
      text: text || '',
      html: html || '',
    } as Parameters<typeof resend.emails.send>[0])

    if (error) {
      console.error('Failed to send email:', error)
      return false
    }

    console.log(`📧 [Mail] Email sent to ${recipients.join(', ')}: ${subject}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Invitation email templates
export function getInvitationEmailHtml(params: {
  organizationName: string
  inviterName: string
  inviteUrl: string
  expiresAt: Date
}): string {
  const { organizationName, inviterName, inviteUrl, expiresAt } = params
  const expiresStr = expiresAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .warning { color: #dc2626; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>プレミア購読</h1>
    </div>
    <div class="content">
      <h2>組織への招待</h2>
      <p>${inviterName}さんから<strong>${organizationName}</strong>への招待が届いています。</p>
      <p>下のボタンをクリックして、アカウントを作成してください。</p>
      <a href="${inviteUrl}" class="button">招待を受け入れる</a>
      <p class="warning">※この招待リンクは${expiresStr}まで有効です。</p>
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

export function getInvitationEmailText(params: {
  organizationName: string
  inviterName: string
  inviteUrl: string
  expiresAt: Date
}): string {
  const { organizationName, inviterName, inviteUrl, expiresAt } = params
  const expiresStr = expiresAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
組織への招待

${inviterName}さんから「${organizationName}」への招待が届いています。

以下のリンクをクリックして、アカウントを作成してください：
${inviteUrl}

※この招待リンクは${expiresStr}まで有効です。

---
このメールはプレミア購読システムから自動送信されています。
リフォーム産業新聞社
  `.trim()
}

// Seminar notification email templates
export function getSeminarNotificationEmailHtml(params: {
  seminarTitle: string
  scheduledAt: Date
  speakerName: string
  description: string
  zoomUrl: string
  category: string
}): string {
  const { seminarTitle, scheduledAt, speakerName, description, zoomUrl, category } = params
  const dateStr = scheduledAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const timeStr = scheduledAt.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .info { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .info-row { margin: 8px 0; }
    .label { color: #666; font-size: 14px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .category { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 16px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>プレミア購読</h1>
    </div>
    <div class="content">
      <span class="category">${category}</span>
      <h2>セミナーのお知らせ</h2>
      <div class="info">
        <div class="info-row">
          <span class="label">タイトル</span><br>
          <strong>${seminarTitle}</strong>
        </div>
        <div class="info-row">
          <span class="label">日時</span><br>
          ${dateStr} ${timeStr}
        </div>
        <div class="info-row">
          <span class="label">講師</span><br>
          ${speakerName}
        </div>
        <div class="info-row">
          <span class="label">概要</span><br>
          ${description}
        </div>
      </div>
      <a href="${zoomUrl}" class="button">Zoomで参加する</a>
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

export function getSeminarNotificationEmailText(params: {
  seminarTitle: string
  scheduledAt: Date
  speakerName: string
  description: string
  zoomUrl: string
  category: string
}): string {
  const { seminarTitle, scheduledAt, speakerName, description, zoomUrl, category } = params
  const dateStr = scheduledAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const timeStr = scheduledAt.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
【${category}】セミナーのお知らせ

タイトル: ${seminarTitle}
日時: ${dateStr} ${timeStr}
講師: ${speakerName}

概要:
${description}

Zoom参加URL: ${zoomUrl}

---
このメールはプレミア購読システムから自動送信されています。
リフォーム産業新聞社
  `.trim()
}

// Community post notification email template
export function getCommunityPostEmailHtml(params: {
  categoryName: string
  postTitle: string
  authorName: string
  postUrl: string
}): string {
  const { categoryName, postTitle, authorName, postUrl } = params

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>プレミア購読</h1>
    </div>
    <div class="content">
      <h2>コミュニティに新しい投稿があります</h2>
      <p><strong>カテゴリ:</strong> ${categoryName}</p>
      <p><strong>タイトル:</strong> ${postTitle}</p>
      <p><strong>投稿者:</strong> ${authorName}</p>
      <a href="${postUrl}" class="button">投稿を見る</a>
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

// Get community post plain text email
export function getCommunityPostEmailText(params: {
  categoryName: string
  postTitle: string
  authorName: string
  postUrl: string
}): string {
  const { categoryName, postTitle, authorName, postUrl } = params

  return `
コミュニティに新しい投稿があります

カテゴリ: ${categoryName}
タイトル: ${postTitle}
投稿者: ${authorName}

投稿を見る: ${postUrl}

---
このメールはプレミア購読システムから自動送信されています。
リフォーム産業新聞社
  `.trim()
}

// Renewal reminder email template
export function getRenewalReminderEmailHtml(params: {
  organizationName: string
  planType: string
  expiresAt: Date
  daysRemaining: number
  renewalUrl: string
}): string {
  const { organizationName, planType, expiresAt, daysRemaining, renewalUrl } = params
  const expiresStr = expiresAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const planName = planType === 'EXPERT' ? 'エキスパート' : 'スタンダード'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .info { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .warning { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>契約更新のお知らせ</h1>
    </div>
    <div class="content">
      <p><strong>${organizationName}</strong> 様</p>
      <p>いつもプレミア購読をご利用いただき、ありがとうございます。</p>

      <div class="info">
        <p>ご契約中のプレミア購読「<strong>${planName}プラン</strong>」の契約期間が<span class="warning">あと${daysRemaining}日</span>で終了となります。</p>
        <p><strong>契約終了日：</strong>${expiresStr}</p>
      </div>

      <p>引き続きサービスをご利用いただくには、契約の更新手続きをお願いいたします。</p>
      <p>自動更新が有効な場合は、登録されているお支払い方法で自動的に更新されます。</p>

      <a href="${renewalUrl}" class="button">契約を確認する</a>
    </div>
    <div class="footer">
      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
      <p>このメールはプレミア購読システムから自動送信されています。</p>
      <p>リフォーム産業新聞社</p>
    </div>
  </div>
</body>
</html>
  `
}

export function getRenewalReminderEmailText(params: {
  organizationName: string
  planType: string
  expiresAt: Date
  daysRemaining: number
  renewalUrl: string
}): string {
  const { organizationName, planType, expiresAt, daysRemaining, renewalUrl } = params
  const expiresStr = expiresAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const planName = planType === 'EXPERT' ? 'エキスパート' : 'スタンダード'

  return `
【契約更新のお知らせ】

${organizationName} 様

いつもプレミア購読をご利用いただき、ありがとうございます。

ご契約中のプレミア購読「${planName}プラン」の契約期間があと${daysRemaining}日で終了となります。

契約終了日：${expiresStr}

引き続きサービスをご利用いただくには、契約の更新手続きをお願いいたします。
自動更新が有効な場合は、登録されているお支払い方法で自動的に更新されます。

契約を確認する: ${renewalUrl}

---
ご不明な点がございましたら、お気軽にお問い合わせください。
このメールはプレミア購読システムから自動送信されています。
リフォーム産業新聞社
  `.trim()
}

// Admin contact email template
export function getAdminContactEmailHtml(params: {
  recipientName: string
  organizationName: string
  subject: string
  message: string
  senderName: string
}): string {
  const { recipientName, organizationName, subject, message, senderName } = params

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .message { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; white-space: pre-wrap; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>プレミア購読</h1>
    </div>
    <div class="content">
      <p><strong>${recipientName}</strong> 様 (${organizationName})</p>
      <p>プレミア購読運営事務局よりご連絡です。</p>

      <h3>${subject}</h3>
      <div class="message">${message}</div>

      <p>ご不明な点がございましたら、このメールに返信してお問い合わせください。</p>
    </div>
    <div class="footer">
      <p>担当: ${senderName}</p>
      <p>リフォーム産業新聞社 プレミア購読運営事務局</p>
    </div>
  </div>
</body>
</html>
  `
}

export function getAdminContactEmailText(params: {
  recipientName: string
  organizationName: string
  subject: string
  message: string
  senderName: string
}): string {
  const { recipientName, organizationName, subject, message, senderName } = params

  return `
${recipientName} 様 (${organizationName})

プレミア購読運営事務局よりご連絡です。

【${subject}】

${message}

---
ご不明な点がございましたら、このメールに返信してお問い合わせください。

担当: ${senderName}
リフォーム産業新聞社 プレミア購読運営事務局
  `.trim()
}

// Renewal notice email template (for admin-initiated renewal reminders)
export function getAdminRenewalNoticeEmailHtml(params: {
  organizationName: string
  recipientName: string
  planType: string
  expiresAt: Date
  daysRemaining: number
  contactInfo: string
}): string {
  const { organizationName, recipientName, planType, expiresAt, daysRemaining, contactInfo } = params
  const expiresStr = expiresAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const planName = planType === 'EXPERT' ? 'エキスパート' : 'スタンダード'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .info { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .warning { color: #dc2626; font-weight: bold; }
    .highlight { background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>【重要】契約更新のご案内</h1>
    </div>
    <div class="content">
      <p><strong>${recipientName}</strong> 様</p>
      <p>いつもプレミア購読をご利用いただき、誠にありがとうございます。</p>
      <p><strong>${organizationName}</strong>様のご契約について、更新時期が近づいておりますのでご連絡いたします。</p>

      <div class="info">
        <p><strong>プラン：</strong>${planName}プラン</p>
        <p><strong>契約終了日：</strong>${expiresStr}</p>
        <p class="warning">残り${daysRemaining}日</p>
      </div>

      <p>引き続きサービスをご利用いただける場合は、契約更新の手続きをお願いいたします。</p>

      <div class="highlight">
        <strong>更新手続きについて</strong><br>
        ${contactInfo}
      </div>
    </div>
    <div class="footer">
      <p>ご質問がございましたら、このメールに返信してお問い合わせください。</p>
      <p>リフォーム産業新聞社 プレミア購読運営事務局</p>
    </div>
  </div>
</body>
</html>
  `
}

export function getAdminRenewalNoticeEmailText(params: {
  organizationName: string
  recipientName: string
  planType: string
  expiresAt: Date
  daysRemaining: number
  contactInfo: string
}): string {
  const { organizationName, recipientName, planType, expiresAt, daysRemaining, contactInfo } = params
  const expiresStr = expiresAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const planName = planType === 'EXPERT' ? 'エキスパート' : 'スタンダード'

  return `
【重要】契約更新のご案内

${recipientName} 様

いつもプレミア購読をご利用いただき、誠にありがとうございます。
${organizationName}様のご契約について、更新時期が近づいておりますのでご連絡いたします。

プラン：${planName}プラン
契約終了日：${expiresStr}
残り${daysRemaining}日

引き続きサービスをご利用いただける場合は、契約更新の手続きをお願いいたします。

【更新手続きについて】
${contactInfo}

---
ご質問がございましたら、このメールに返信してお問い合わせください。
リフォーム産業新聞社 プレミア購読運営事務局
  `.trim()
}
