import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import {
  success,
  error,
  methodNotAllowed,
  internalError,
  ErrorCodes,
} from '@/lib/api-response'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET'])
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
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
      return error(res, ErrorCodes.NOT_FOUND, 'ユーザーが見つかりません')
    }

    const userOrg = user.organizations[0]
    if (!userOrg) {
      return error(res, ErrorCodes.FORBIDDEN, '組織に所属していません')
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

    return success(res, { user: responseUser })
  } catch (err) {
    console.error('Get user error:', err)
    return internalError(res)
  }
}
