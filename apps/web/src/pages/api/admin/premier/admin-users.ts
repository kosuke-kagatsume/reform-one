import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdminPermission } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { authorized, error } = await requireAdminPermission(req, 'VIEW')
    if (!authorized) return res.status(403).json({ error })

    try {
      const reformOrg = await prisma.organization.findFirst({
        where: { type: 'REFORM_COMPANY' }
      })

      if (!reformOrg) {
        return res.status(200).json({ users: [] })
      }

      const userOrgs = await prisma.userOrganization.findMany({
        where: { organizationId: reformOrg.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              adminPermissionLevel: true,
              lastLoginAt: true,
              status: true,
              createdAt: true
            }
          }
        }
      })

      const users = userOrgs.map(uo => ({
        ...uo.user,
        role: uo.role
      }))

      return res.status(200).json({ users })
    } catch (error) {
      console.error('Get admin users error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { authorized, user: adminUser, error } = await requireAdminPermission(req, 'FULL')
    if (!authorized) return res.status(403).json({ error })

    const { email, name, adminPermissionLevel } = req.body

    if (!email) {
      return res.status(400).json({ error: 'メールアドレスは必須です' })
    }

    try {
      const reformOrg = await prisma.organization.findFirst({
        where: { type: 'REFORM_COMPANY' }
      })

      if (!reformOrg) {
        return res.status(400).json({ error: 'Reform Company組織が見つかりません' })
      }

      let user = await prisma.user.findUnique({ where: { email } })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || null,
            password: '',
            userType: 'EMPLOYEE',
            adminPermissionLevel: adminPermissionLevel || 'VIEW'
          }
        })
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            adminPermissionLevel: adminPermissionLevel || 'VIEW'
          }
        })
      }

      const existingLink = await prisma.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: reformOrg.id
          }
        }
      })

      if (!existingLink) {
        await prisma.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: reformOrg.id,
            role: 'ADMIN'
          }
        })
      }

      await logAdminAction({
        userId: adminUser.id,
        action: 'CREATE_ADMIN_USER',
        resource: 'user',
        resourceId: user.id,
        metadata: { email, adminPermissionLevel }
      })

      return res.status(201).json({ user })
    } catch (error) {
      console.error('Create admin user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const { authorized, user: adminUser, error } = await requireAdminPermission(req, 'FULL')
    if (!authorized) return res.status(403).json({ error })

    const { userId, adminPermissionLevel } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'ユーザーIDは必須です' })
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { adminPermissionLevel }
      })

      await logAdminAction({
        userId: adminUser.id,
        action: 'UPDATE_ADMIN_PERMISSION',
        resource: 'user',
        resourceId: userId,
        metadata: { adminPermissionLevel }
      })

      return res.status(200).json({ user })
    } catch (error) {
      console.error('Update admin user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    const { authorized, user: adminUser, error } = await requireAdminPermission(req, 'FULL')
    if (!authorized) return res.status(403).json({ error })

    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'ユーザーIDは必須です' })
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { adminPermissionLevel: null }
      })

      await logAdminAction({
        userId: adminUser.id,
        action: 'REMOVE_ADMIN_USER',
        resource: 'user',
        resourceId: userId
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete admin user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
