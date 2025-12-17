import { nanoid } from 'nanoid'
import { prisma, Role } from '@reform-one/database'
import { InviteInput } from './validation'
import { AuthError, ErrorCode } from './errors'
import { checkDomainRestriction, checkSeatLimit, isOrgAdmin } from './rbac'
import { hashPassword } from './auth'

const INVITATION_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function createInvitation(
  organizationId: string,
  invitedById: string,
  input: InviteInput
): Promise<{ token: string; inviteUrl: string }> {
  // Check if inviter is admin
  const isAdmin = await isOrgAdmin(invitedById, organizationId)
  if (!isAdmin) {
    throw new AuthError(ErrorCode.PERMISSION_DENIED, 'Only admins can send invitations')
  }
  
  // Check domain restriction
  const isDomainAllowed = await checkDomainRestriction(input.email, organizationId)
  if (!isDomainAllowed) {
    throw new AuthError(ErrorCode.DOMAIN_NOT_ALLOWED, 'Email domain not allowed')
  }
  
  // Check seat limit
  const hasSeatsAvailable = await checkSeatLimit(organizationId)
  if (!hasSeatsAvailable) {
    throw new AuthError(ErrorCode.SEAT_LIMIT_EXCEEDED, 'Organization seat limit reached')
  }
  
  // Check if user already in organization
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      organizations: true,
    },
  })
  
  if (existingUser) {
    const alreadyInOrg = existingUser.organizations.some(
      (uo) => uo.organizationId === organizationId
    )
    if (alreadyInOrg) {
      throw new AuthError(ErrorCode.VALIDATION_ERROR, 'User already in organization')
    }
  }
  
  // Create invitation
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY)
  
  const invitation = await prisma.invitation.create({
    data: {
      email: input.email,
      token,
      organizationId,
      role: input.role,
      invitedById,
      expiresAt,
    },
  })
  
  // Log invitation
  await prisma.auditLog.create({
    data: {
      userId: invitedById,
      orgId: organizationId,
      action: 'invitation.created',
      resource: `invitation:${invitation.id}`,
      metadata: JSON.stringify({ email: input.email, role: input.role }),
    },
  })
  
  const inviteUrl = `${process.env.APP_URL}/invite/${token}`
  
  return { token, inviteUrl }
}

export async function acceptInvitation(
  token: string,
  password?: string,
  name?: string
) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: true,
    },
  })
  
  if (!invitation) {
    throw new AuthError(ErrorCode.AUTH_INVITATION_INVALID, 'Invalid invitation')
  }
  
  if (invitation.acceptedAt) {
    throw new AuthError(ErrorCode.AUTH_INVITATION_INVALID, 'Invitation already accepted')
  }
  
  if (invitation.expiresAt < new Date()) {
    throw new AuthError(ErrorCode.AUTH_INVITATION_EXPIRED, 'Invitation expired')
  }
  
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: invitation.email },
  })
  
  if (!user) {
    // Create new user
    if (!password) {
      throw new AuthError(ErrorCode.VALIDATION_ERROR, 'Password required for new user')
    }
    
    const hashedPassword = await hashPassword(password)
    
    user = await prisma.user.create({
      data: {
        email: invitation.email,
        password: hashedPassword,
        name,
        emailVerified: true, // Auto-verify invited users
      },
    })
  }
  
  // Add user to organization
  await prisma.$transaction(async (tx) => {
    // Create user-organization link
    await tx.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    })
    
    // Mark invitation as accepted
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    })
    
    // Log acceptance
    await tx.auditLog.create({
      data: {
        userId: user.id,
        orgId: invitation.organizationId,
        action: 'invitation.accepted',
        resource: `invitation:${invitation.id}`,
        metadata: JSON.stringify({ email: invitation.email }),
      },
    })
  })
  
  return {
    user,
    organization: invitation.organization,
  }
}

export async function revokeInvitation(
  invitationId: string,
  revokedBy: string,
  organizationId: string
) {
  // Check if revoker is admin
  const isAdmin = await isOrgAdmin(revokedBy, organizationId)
  if (!isAdmin) {
    throw new AuthError(ErrorCode.PERMISSION_DENIED, 'Only admins can revoke invitations')
  }
  
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      organizationId,
    },
  })
  
  if (!invitation) {
    throw new AuthError(ErrorCode.RESOURCE_NOT_FOUND, 'Invitation not found')
  }
  
  if (invitation.acceptedAt) {
    throw new AuthError(ErrorCode.VALIDATION_ERROR, 'Cannot revoke accepted invitation')
  }
  
  await prisma.invitation.delete({
    where: { id: invitationId },
  })
  
  await prisma.auditLog.create({
    data: {
      userId: revokedBy,
      orgId: organizationId,
      action: 'invitation.revoked',
      resource: `invitation:${invitationId}`,
      metadata: JSON.stringify({ email: invitation.email }),
    },
  })
}

export async function listPendingInvitations(organizationId: string) {
  return prisma.invitation.findMany({
    where: {
      organizationId,
      acceptedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      invitedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}