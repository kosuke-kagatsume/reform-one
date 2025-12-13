import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  const { email, password } = req.body

  if (!email || !password) {
    return error(
      res,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      'メールアドレスとパスワードは必須です',
      { fields: ['email', 'password'] }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                subscriptions: {
                  where: { status: 'ACTIVE' },
                  take: 1
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return error(
        res,
        ErrorCodes.INVALID_CREDENTIALS,
        'このメールアドレスのアカウントは見つかりません。入力ミスか、未登録の可能性があります。'
      )
    }

    if (!user.password) {
      return error(
        res,
        ErrorCodes.INVALID_CREDENTIALS,
        'マジックリンクでログインしてください'
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return error(
        res,
        ErrorCodes.INVALID_CREDENTIALS,
        'パスワードが違います。大文字・小文字をご確認ください。'
      )
    }

    const userOrg = user.organizations[0]
    if (!userOrg) {
      return error(
        res,
        ErrorCodes.FORBIDDEN,
        '組織に所属していません'
      )
    }

    const subscription = userOrg.organization.subscriptions[0] || null

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      organization: {
        id: userOrg.organization.id,
        name: userOrg.organization.name,
        slug: userOrg.organization.slug,
        type: userOrg.organization.type,
        createdAt: userOrg.organization.createdAt,
        updatedAt: userOrg.organization.updatedAt
      },
      role: userOrg.role,
      subscription: subscription ? {
        id: subscription.id,
        organizationId: subscription.organizationId,
        planType: subscription.planType,
        status: subscription.status,
        paymentMethod: subscription.paymentMethod,
        basePrice: subscription.basePrice,
        discountPercent: subscription.discountPercent,
        discountAmount: subscription.discountAmount,
        finalPrice: subscription.finalPrice,
        autoRenewal: subscription.autoRenewal,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAt: subscription.cancelAt,
        canceledAt: subscription.canceledAt
      } : null
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        orgId: userOrg.organization.id,
        action: 'user.login',
        ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    })

    // Set session cookie for API authentication
    res.setHeader('Set-Cookie', `premier_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)

    return success(res, { user: responseUser }, 'ログインに成功しました')
  } catch (err) {
    console.error('Login error:', err)
    return internalError(res)
  }
}
