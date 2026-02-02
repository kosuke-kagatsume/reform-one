import type { NextApiRequest } from 'next'
import { prisma } from '@/lib/prisma'
import type { AdminPermissionLevel } from '@/types/premier'

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key && value) acc[key] = value
    return acc
  }, {} as Record<string, string>)
}

const PERMISSION_HIERARCHY: Record<string, number> = {
  VIEW: 1,
  EDIT: 2,
  FULL: 3
}

export async function getAdminUser(req: NextApiRequest) {
  const cookies = parseCookies(req.headers.cookie)
  const sessionUserId = cookies['premier_session']

  if (!sessionUserId) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    include: {
      organizations: {
        include: {
          organization: {
            select: { type: true }
          }
        }
      }
    }
  })

  if (!user) return null

  const isReformCompany = user.organizations.some(
    org => org.organization.type === 'REFORM_COMPANY'
  )

  if (!isReformCompany) return null

  return user
}

export async function requireAdminPermission(
  req: NextApiRequest,
  minimumLevel: AdminPermissionLevel
): Promise<{ authorized: boolean; user: any; error?: string }> {
  const user = await getAdminUser(req)

  if (!user) {
    return { authorized: false, user: null, error: '管理者権限が必要です' }
  }

  const userLevel = (user as any).adminPermissionLevel || 'FULL'
  const userLevelNum = PERMISSION_HIERARCHY[userLevel] || 0
  const requiredLevelNum = PERMISSION_HIERARCHY[minimumLevel] || 0

  if (userLevelNum < requiredLevelNum) {
    return { authorized: false, user, error: 'この操作を行う権限がありません' }
  }

  return { authorized: true, user }
}
