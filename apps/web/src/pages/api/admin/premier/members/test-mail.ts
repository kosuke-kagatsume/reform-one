import type { NextApiRequest, NextApiResponse } from 'next'
import { sendMail } from '@/lib/mail'
import { requireAdminPermission } from '@/lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { authorized, error } = await requireAdminPermission(req, 'EDIT')
  if (!authorized) return res.status(403).json({ error })

  const { testEmail, subject, body, signature } = req.body

  if (!testEmail || !subject || !body) {
    return res.status(400).json({ error: 'テスト送信先、件名、本文は必須です' })
  }

  try {
    const fullBody = signature ? `${body}\n\n${signature}` : body

    const success = await sendMail({
      to: testEmail,
      subject: `[テスト送信] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; padding: 10px; text-align: center; color: white; font-size: 12px;">
            テスト送信
          </div>
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

    if (success) {
      return res.status(200).json({ success: true })
    } else {
      return res.status(500).json({ error: 'テスト送信に失敗しました' })
    }
  } catch (error) {
    console.error('Test mail error:', error)
    return res.status(500).json({ error: 'テスト送信に失敗しました' })
  }
}
