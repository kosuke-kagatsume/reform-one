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

// B-3: リマインドメール設定API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return error(res, ErrorCodes.UNAUTHORIZED, '認証が必要です')
    }

    // ユーザーの組織を取得
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: auth.userId },
      include: { organization: true }
    })

    if (!userOrg || userOrg.role !== 'ADMIN') {
      return error(res, ErrorCodes.FORBIDDEN, '管理者権限が必要です')
    }

    const organizationId = userOrg.organizationId

    // GET: 設定取得
    if (req.method === 'GET') {
      const setting = await prisma.reminderSetting.findUnique({
        where: { organizationId }
      })

      // 設定がない場合はデフォルト値を返す
      if (!setting) {
        return success(res, {
          isEnabled: false,
          daysThreshold: 14,
          targetType: 'ALL'
        })
      }

      return success(res, setting)
    }

    // PUT: 設定更新
    if (req.method === 'PUT') {
      const { enabled, daysThreshold, targetType } = req.body

      // バリデーション
      if (daysThreshold !== undefined && (daysThreshold < 1 || daysThreshold > 90)) {
        return error(res, ErrorCodes.INVALID_INPUT, '日数は1〜90の範囲で指定してください')
      }

      const setting = await prisma.reminderSetting.upsert({
        where: { organizationId },
        update: {
          isEnabled: enabled ?? false,
          daysThreshold: daysThreshold ?? 14,
          targetType: targetType ?? 'ALL'
        },
        create: {
          organizationId,
          isEnabled: enabled ?? false,
          daysThreshold: daysThreshold ?? 14,
          targetType: targetType ?? 'ALL'
        }
      })

      return success(res, setting, 'リマインド設定を更新しました')
    }

    return methodNotAllowed(res, ['GET', 'PUT'])
  } catch (err) {
    console.error('Reminder settings error:', err)
    return internalError(res)
  }
}
