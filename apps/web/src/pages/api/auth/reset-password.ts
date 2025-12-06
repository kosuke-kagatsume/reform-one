import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ error: 'トークンとパスワードは必須です' })
    }

    // パスワード強度チェック
    if (password.length < 8) {
      return res.status(400).json({ error: 'パスワードは8文字以上である必要があります' })
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'パスワードには大文字を含める必要があります' })
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'パスワードには小文字を含める必要があります' })
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'パスワードには数字を含める必要があります' })
    }

    // トークンを検証
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return res.status(400).json({ error: '無効なトークンです' })
    }

    if (resetToken.usedAt) {
      return res.status(400).json({ error: 'このトークンは既に使用されています' })
    }

    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'トークンの有効期限が切れています' })
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // トランザクションでパスワード更新とトークン使用済みマーク
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    // 監査ログを記録
    await prisma.auditLog.create({
      data: {
        userId: resetToken.userId,
        action: 'user.password_reset',
        ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    })

    return res.status(200).json({ message: 'パスワードを変更しました' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
}
