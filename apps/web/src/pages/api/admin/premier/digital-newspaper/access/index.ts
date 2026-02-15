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

// 管理者用: 電子版アクセス権限管理API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.userType !== 'EMPLOYEE') {
      return error(res, ErrorCodes.UNAUTHORIZED, '管理者権限が必要です')
    }

    // GET: アクセス権限一覧
    if (req.method === 'GET') {
      const { organizationId } = req.query

      const whereCondition: any = {}
      if (organizationId && typeof organizationId === 'string') {
        whereCondition.organizationId = organizationId
      }

      const accessList = await prisma.digitalNewspaperAccess.findMany({
        where: whereCondition,
        include: {
          organization: {
            select: { id: true, name: true }
          }
        }
      })

      // ユーザー情報を取得
      const userIds = accessList.map(a => a.userId)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true }
      })
      const userMap = new Map(users.map(u => [u.id, u]))

      const result = accessList.map(access => ({
        ...access,
        user: userMap.get(access.userId)
      }))

      return success(res, { accessList: result })
    }

    // POST: アクセス権限を付与
    if (req.method === 'POST') {
      const { organizationId, userId } = req.body

      if (!organizationId || !userId) {
        return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, '組織IDとユーザーIDは必須です')
      }

      // 組織の存在確認
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
      })
      if (!organization) {
        return error(res, ErrorCodes.NOT_FOUND, '組織が見つかりません')
      }

      // ユーザーの存在確認
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      if (!user) {
        return error(res, ErrorCodes.NOT_FOUND, 'ユーザーが見つかりません')
      }

      // ユーザーがその組織に所属しているか確認
      const userOrg = await prisma.userOrganization.findFirst({
        where: { userId, organizationId }
      })
      if (!userOrg) {
        return error(res, ErrorCodes.FORBIDDEN, 'ユーザーはこの組織に所属していません')
      }

      // 既存のアクセス権を確認（1組織1ユーザー制限）
      const existing = await prisma.digitalNewspaperAccess.findUnique({
        where: { organizationId }
      })

      if (existing) {
        // 既存のアクセス権を更新（ユーザーを変更）
        const access = await prisma.digitalNewspaperAccess.update({
          where: { id: existing.id },
          data: {
            userId,
            grantedAt: new Date(),
            grantedBy: auth.userId
          }
        })

        // 操作ログ
        await prisma.auditLog.create({
          data: {
            userId: auth.userId,
            action: 'digital_newspaper_access.update',
            resource: organizationId,
            metadata: JSON.stringify({ oldUserId: existing.userId, newUserId: userId })
          }
        })

        return success(res, { access }, 'アクセス権限を更新しました')
      } else {
        // 新規作成
        const access = await prisma.digitalNewspaperAccess.create({
          data: {
            organizationId,
            userId,
            grantedBy: auth.userId
          }
        })

        // 操作ログ
        await prisma.auditLog.create({
          data: {
            userId: auth.userId,
            action: 'digital_newspaper_access.create',
            resource: organizationId,
            metadata: JSON.stringify({ userId })
          }
        })

        return success(res, { access }, 'アクセス権限を付与しました')
      }
    }

    // DELETE: アクセス権限を削除
    if (req.method === 'DELETE') {
      const { organizationId } = req.body

      if (!organizationId) {
        return error(res, ErrorCodes.MISSING_REQUIRED_FIELD, '組織IDは必須です')
      }

      const existing = await prisma.digitalNewspaperAccess.findUnique({
        where: { organizationId }
      })

      if (!existing) {
        return error(res, ErrorCodes.NOT_FOUND, 'アクセス権限が見つかりません')
      }

      await prisma.digitalNewspaperAccess.delete({
        where: { id: existing.id }
      })

      // 操作ログ
      await prisma.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'digital_newspaper_access.delete',
          resource: organizationId,
          metadata: JSON.stringify({ userId: existing.userId })
        }
      })

      return success(res, null, 'アクセス権限を削除しました')
    }

    return methodNotAllowed(res, ['GET', 'POST', 'DELETE'])
  } catch (err) {
    console.error('Digital newspaper access API error:', err)
    return internalError(res)
  }
}
