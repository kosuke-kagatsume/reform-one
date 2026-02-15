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

// A-6: 操作ログのロールバック機能（限定スコープ）
// サポートする操作:
// - *.update: isPublished, status などの状態変更をロールバック
// - *.delete: isCanceled を false に戻す（論理削除のロールバック）

const ROLLBACKABLE_ACTIONS = [
  'online_site_visit.update',
  'online_site_visit.delete',
  'site_visit.update',
  'site_visit.delete',
  'seminar.update',
  'archive.update',
  'digital_newspaper_edition.update',
  'digital_newspaper_edition.delete'
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST'])
  }

  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.userType !== 'EMPLOYEE') {
      return error(res, ErrorCodes.UNAUTHORIZED, '管理者権限が必要です')
    }

    const { logId } = req.body

    if (!logId) {
      return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, 'ログIDが必要です')
    }

    // 操作ログを取得
    const auditLog = await prisma.auditLog.findUnique({
      where: { id: logId }
    })

    if (!auditLog) {
      return error(res, ErrorCodes.NOT_FOUND, '操作ログが見つかりません')
    }

    // ロールバック可能かチェック
    if (!ROLLBACKABLE_ACTIONS.includes(auditLog.action)) {
      return error(res, ErrorCodes.FORBIDDEN, 'この操作はロールバックできません')
    }

    // メタデータからロールバック情報を取得
    let metadata: Record<string, unknown> = {}
    try {
      metadata = auditLog.metadata ? JSON.parse(auditLog.metadata) : {}
    } catch {
      return error(res, ErrorCodes.INVALID_INPUT, 'メタデータが不正です')
    }

    const resourceId = auditLog.resource
    if (!resourceId) {
      return error(res, ErrorCodes.INVALID_INPUT, 'リソースIDがありません')
    }

    // 操作タイプに応じてロールバック実行
    const [resourceType, actionType] = auditLog.action.split('.')

    let rollbackResult: { success: boolean; message: string } = { success: false, message: '' }

    switch (resourceType) {
      case 'online_site_visit': {
        const existing = await prisma.onlineSiteVisit.findUnique({ where: { id: resourceId } })
        if (!existing) {
          return error(res, ErrorCodes.NOT_FOUND, 'オンライン見学会が見つかりません')
        }

        if (actionType === 'delete') {
          // 論理削除のロールバック: isCanceled を false に戻す
          await prisma.onlineSiteVisit.update({
            where: { id: resourceId },
            data: { isCanceled: false }
          })
          rollbackResult = { success: true, message: 'オンライン見学会のキャンセルを取り消しました' }
        } else if (actionType === 'update' && metadata.before) {
          // 更新のロールバック: beforeの状態に戻す
          const before = metadata.before as Record<string, unknown>
          await prisma.onlineSiteVisit.update({
            where: { id: resourceId },
            data: {
              isPublished: typeof before.isPublished === 'boolean' ? before.isPublished : undefined,
              isCanceled: typeof before.isCanceled === 'boolean' ? before.isCanceled : undefined,
            }
          })
          rollbackResult = { success: true, message: 'オンライン見学会の変更をロールバックしました' }
        }
        break
      }

      case 'site_visit': {
        const existing = await prisma.siteVisit.findUnique({ where: { id: resourceId } })
        if (!existing) {
          return error(res, ErrorCodes.NOT_FOUND, '視察会が見つかりません')
        }

        if (actionType === 'delete') {
          await prisma.siteVisit.update({
            where: { id: resourceId },
            data: { isCanceled: false }
          })
          rollbackResult = { success: true, message: '視察会のキャンセルを取り消しました' }
        } else if (actionType === 'update' && metadata.before) {
          const before = metadata.before as Record<string, unknown>
          await prisma.siteVisit.update({
            where: { id: resourceId },
            data: {
              isPublished: typeof before.isPublished === 'boolean' ? before.isPublished : undefined,
              isCanceled: typeof before.isCanceled === 'boolean' ? before.isCanceled : undefined,
            }
          })
          rollbackResult = { success: true, message: '視察会の変更をロールバックしました' }
        }
        break
      }

      case 'digital_newspaper_edition': {
        const existing = await prisma.digitalNewspaperEdition.findUnique({ where: { id: resourceId } })
        if (!existing) {
          return error(res, ErrorCodes.NOT_FOUND, '電子版新聞が見つかりません')
        }

        if (actionType === 'update' && metadata.before) {
          const before = metadata.before as Record<string, unknown>
          await prisma.digitalNewspaperEdition.update({
            where: { id: resourceId },
            data: {
              isPublished: typeof before.isPublished === 'boolean' ? before.isPublished : undefined,
            }
          })
          rollbackResult = { success: true, message: '電子版新聞の変更をロールバックしました' }
        }
        break
      }

      default:
        return error(res, ErrorCodes.FORBIDDEN, 'この操作はロールバックできません')
    }

    if (!rollbackResult.success) {
      return error(res, ErrorCodes.INVALID_INPUT, 'ロールバックに必要な情報がありません')
    }

    // ロールバック操作をログに記録
    await prisma.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'audit_log.rollback',
        resource: logId,
        metadata: JSON.stringify({
          originalAction: auditLog.action,
          originalResource: auditLog.resource,
          message: rollbackResult.message
        })
      }
    })

    return success(res, { rolledBack: true }, rollbackResult.message)
  } catch (err) {
    console.error('Rollback API error:', err)
    return internalError(res)
  }
}
