import { prisma, Role, User, Organization } from '@reform-one/database'
import { PermissionError, AuthError, ErrorCode } from './errors'

export interface Permission {
  resource: string
  action: string
  scope?: 'organization' | 'department' | 'own'
}

export interface UserContext {
  userId: string
  organizationId: string
  role: Role
  departmentId?: string
}

// Define role permissions
const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    // Full access to everything
    { resource: '*', action: '*', scope: 'organization' },
  ],
  DEPARTMENT_MANAGER: [
    // Department-level access
    { resource: 'users', action: 'read', scope: 'department' },
    { resource: 'users', action: 'invite', scope: 'department' },
    { resource: 'content', action: '*', scope: 'department' },
    { resource: 'reports', action: 'read', scope: 'department' },
    { resource: 'materials', action: '*', scope: 'department' },
  ],
  MEMBER: [
    // Basic member access
    { resource: 'users', action: 'read', scope: 'own' },
    { resource: 'content', action: 'read', scope: 'organization' },
    { resource: 'materials', action: 'read', scope: 'organization' },
    { resource: 'profile', action: '*', scope: 'own' },
  ],
}

export function hasPermission(
  userContext: UserContext,
  resource: string,
  action: string,
  targetScope?: 'organization' | 'department' | 'own'
): boolean {
  const permissions = rolePermissions[userContext.role]
  
  for (const permission of permissions) {
    // Check wildcard permissions
    if (permission.resource === '*' || permission.resource === resource) {
      if (permission.action === '*' || permission.action === action) {
        // Check scope
        if (!targetScope || !permission.scope) {
          return true
        }
        
        if (permission.scope === 'organization') {
          return true
        }
        
        if (permission.scope === 'department' && targetScope === 'department') {
          return true
        }
        
        if (permission.scope === 'own' && targetScope === 'own') {
          return true
        }
      }
    }
  }
  
  return false
}

export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<Role | null> {
  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  })
  
  return userOrg?.role || null
}

export async function enforcePermission(
  userContext: UserContext,
  resource: string,
  action: string,
  targetScope?: 'organization' | 'department' | 'own'
): Promise<void> {
  if (!hasPermission(userContext, resource, action, targetScope)) {
    throw new PermissionError(
      `User does not have permission to ${action} ${resource}`,
      {
        userId: userContext.userId,
        role: userContext.role,
        resource,
        action,
      }
    )
  }
}

export async function checkDomainRestriction(
  email: string,
  organizationId: string
): Promise<boolean> {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId },
  })
  
  if (!settings || settings.allowedDomains.length === 0) {
    return true // No restriction
  }
  
  const emailDomain = email.split('@')[1]
  return settings.allowedDomains.includes(emailDomain)
}

export async function checkSeatLimit(organizationId: string): Promise<boolean> {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId },
  })
  
  if (!settings || !settings.seatLimit) {
    return true // No limit
  }
  
  const currentUsers = await prisma.userOrganization.count({
    where: { organizationId },
  })
  
  return currentUsers < settings.seatLimit
}

export async function isOrgAdmin(userId: string, organizationId: string): Promise<boolean> {
  const role = await getUserRole(userId, organizationId)
  return role === 'ADMIN'
}

export async function getOrganizationAdmins(organizationId: string) {
  const admins = await prisma.userOrganization.findMany({
    where: {
      organizationId,
      role: 'ADMIN',
    },
    include: {
      user: true,
    },
  })
  
  return admins.map((admin) => admin.user)
}

export async function countOrganizationAdmins(organizationId: string): Promise<number> {
  return prisma.userOrganization.count({
    where: {
      organizationId,
      role: 'ADMIN',
    },
  })
}

export async function changeUserRole(
  userId: string,
  organizationId: string,
  newRole: Role,
  performedBy: string
): Promise<void> {
  // Check if performer is admin
  const performerIsAdmin = await isOrgAdmin(performedBy, organizationId)
  if (!performerIsAdmin) {
    throw new PermissionError('Only admins can change user roles')
  }
  
  // Don't allow removing the last admin
  if (newRole !== 'ADMIN') {
    const currentRole = await getUserRole(userId, organizationId)
    if (currentRole === 'ADMIN') {
      const adminCount = await countOrganizationAdmins(organizationId)
      if (adminCount <= 1) {
        throw new AuthError(
          ErrorCode.VALIDATION_ERROR,
          'Cannot remove the last admin from organization'
        )
      }
    }
  }
  
  // Update role
  await prisma.userOrganization.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    data: { role: newRole },
  })
  
  // Log the change
  await prisma.auditLog.create({
    data: {
      userId: performedBy,
      orgId: organizationId,
      action: 'user.role.changed',
      resource: `user:${userId}`,
      metadata: { newRole, performedBy },
    },
  })
}