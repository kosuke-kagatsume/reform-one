import type { NextApiRequest } from 'next'
import { prisma } from '@/lib/prisma'

export interface AuthResult {
  userId: string
  role: string
  userType: string
  orgId?: string
}

/**
 * APIリクエストから認証情報を検証する
 * ローカルストレージベースの認証のため、クライアントから送られるヘッダーを検証
 *
 * 注意: 本番環境ではJWTトークンやセッションベースの認証に置き換えることを推奨
 */
export async function verifyAuth(req: NextApiRequest): Promise<AuthResult | null> {
  try {
    // Authorization headerからユーザーIDを取得
    const authHeader = req.headers.authorization

    // Bearer tokenまたはX-User-Idヘッダーをチェック
    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      // JWTの場合（将来の実装用）
      const token = authHeader.substring(7)
      // 簡易実装: tokenをuserIdとして扱う
      userId = token
    } else if (req.headers['x-user-id']) {
      userId = req.headers['x-user-id'] as string
    } else if (req.cookies?.premier_session) {
      // Cookieベースのセッション
      userId = req.cookies.premier_session
    }

    if (!userId) {
      return null
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!user) {
      return null
    }

    const userOrg = user.organizations[0]

    return {
      userId: user.id,
      role: userOrg?.role || 'MEMBER',
      userType: user.userType,
      orgId: userOrg?.organization?.id,
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}
