import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'メールアドレスは必須です' })
    }

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // セキュリティ上、ユーザーが存在しない場合も同じレスポンスを返す
    if (!user) {
      return res.status(200).json({
        message: 'パスワードリセットメールを送信しました（登録されている場合）'
      })
    }

    // 既存の未使用トークンを無効化
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    })

    // 新しいトークンを生成
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1時間後

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    // TODO: メール送信
    // 実際の実装ではここでメールを送信する
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    console.log(`Password reset URL for ${email}: ${resetUrl}`)

    // 開発環境ではトークンをレスポンスに含める（本番では削除）
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        message: 'パスワードリセットメールを送信しました',
        token, // 開発環境のみ
        resetUrl, // 開発環境のみ
      })
    }

    return res.status(200).json({
      message: 'パスワードリセットメールを送信しました（登録されている場合）'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
}
