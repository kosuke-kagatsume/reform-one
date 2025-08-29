import bcrypt from 'bcryptjs'
import { prisma, User, Organization } from '@reform-one/database'
import { LoginInput, SignupInput } from './validation'
import { AuthError, ErrorCode } from './errors'
import { createSession } from './session'
import { checkDomainRestriction } from './rbac'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signup(input: SignupInput) {
  const { email, password, name, organizationName } = input
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })
  
  if (existingUser) {
    throw new AuthError(ErrorCode.VALIDATION_ERROR, 'Email already registered')
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password)
  
  // Create organization slug from name
  const slug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  // Create user and organization in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create organization
    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug: slug + '-' + Date.now(), // Ensure uniqueness
        domainRestriction: [],
      },
    })
    
    // Create user
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: false,
      },
    })
    
    // Link user to organization as admin
    await tx.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    })
    
    // Create organization settings
    await tx.organizationSettings.create({
      data: {
        organizationId: organization.id,
        enforceMfa: false,
        allowedDomains: [],
      },
    })
    
    // Log signup
    await tx.auditLog.create({
      data: {
        userId: user.id,
        orgId: organization.id,
        action: 'user.signup',
        resource: `user:${user.id}`,
        metadata: { email, organizationName },
      },
    })
    
    return { user, organization }
  })
  
  // Create session
  const session = await createSession(result.user.id)
  
  return {
    user: result.user,
    organization: result.organization,
    session,
  }
}

export async function login(input: LoginInput, organizationId?: string) {
  const { email, password } = input
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  })
  
  if (!user || !user.password) {
    throw new AuthError(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password')
  }
  
  // Verify password
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    throw new AuthError(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password')
  }
  
  // Check if user belongs to specified organization
  if (organizationId) {
    const userOrg = user.organizations.find(
      (uo) => uo.organizationId === organizationId
    )
    if (!userOrg) {
      throw new AuthError(ErrorCode.USER_NOT_IN_ORGANIZATION, 'User not in organization')
    }
  }
  
  // Check email verification
  if (!user.emailVerified) {
    throw new AuthError(ErrorCode.AUTH_EMAIL_NOT_VERIFIED, 'Please verify your email')
  }
  
  // Check MFA
  if (user.mfaEnabled) {
    throw new AuthError(ErrorCode.AUTH_MFA_REQUIRED, 'MFA required', {
      userId: user.id,
      mfaRequired: true,
    })
  }
  
  // Create session
  const session = await createSession(user.id)
  
  // Log login
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      orgId: organizationId,
      action: 'user.login',
      resource: `user:${user.id}`,
      metadata: { email },
    },
  })
  
  return {
    user,
    session,
    organizations: user.organizations.map((uo) => uo.organization),
  }
}

export async function loginWithMfa(
  userId: string,
  mfaToken: string,
  organizationId?: string
) {
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
    throw new AuthError(ErrorCode.RESOURCE_NOT_FOUND, 'User not found')
  }
  
  // Verify MFA token (implementation in mfa.ts)
  const { verifyTotp } = await import('./mfa')
  const isValidToken = verifyTotp(mfaToken, user.mfaSecret!)
  
  if (!isValidToken) {
    throw new AuthError(ErrorCode.AUTH_MFA_INVALID, 'Invalid MFA token')
  }
  
  // Create session
  const session = await createSession(user.id)
  
  // Log login
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      orgId: organizationId,
      action: 'user.login.mfa',
      resource: `user:${user.id}`,
      metadata: { email: user.email },
    },
  })
  
  return {
    user,
    session,
    organizations: user.organizations.map((uo) => uo.organization),
  }
}

export async function verifyEmail(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  })
  
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'user.email.verified',
      resource: `user:${userId}`,
    },
  })
  
  return user
}