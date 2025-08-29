import { authenticator } from 'otplib'
import { prisma } from '@reform-one/database'
import { AuthError, ErrorCode } from './errors'

// Configure TOTP settings
authenticator.options = {
  window: 1, // Allow 1 time step before/after for clock skew
  step: 30, // 30 second time step
}

export function generateMfaSecret(): string {
  return authenticator.generateSecret()
}

export function generateQrCodeUri(
  email: string,
  secret: string,
  issuer: string = 'Reform One'
): string {
  return authenticator.keyuri(email, issuer, secret)
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch {
    return false
  }
}

export async function setupMfa(userId: string): Promise<{ secret: string; qrCode: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  
  if (!user) {
    throw new AuthError(ErrorCode.RESOURCE_NOT_FOUND, 'User not found')
  }
  
  if (user.mfaEnabled) {
    throw new AuthError(ErrorCode.VALIDATION_ERROR, 'MFA already enabled')
  }
  
  const secret = generateMfaSecret()
  const qrCode = generateQrCodeUri(user.email, secret)
  
  // Store secret temporarily (not enabled yet)
  await prisma.user.update({
    where: { id: userId },
    data: { mfaSecret: secret },
  })
  
  return { secret, qrCode }
}

export async function confirmMfa(userId: string, token: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  
  if (!user || !user.mfaSecret) {
    throw new AuthError(ErrorCode.RESOURCE_NOT_FOUND, 'MFA setup not found')
  }
  
  const isValid = verifyTotp(token, user.mfaSecret)
  if (!isValid) {
    throw new AuthError(ErrorCode.AUTH_MFA_INVALID, 'Invalid MFA token')
  }
  
  // Enable MFA
  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: true },
  })
  
  // Log MFA activation
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'user.mfa.enabled',
      resource: `user:${userId}`,
    },
  })
}

export async function disableMfa(userId: string, token: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    throw new AuthError(ErrorCode.VALIDATION_ERROR, 'MFA not enabled')
  }
  
  const isValid = verifyTotp(token, user.mfaSecret)
  if (!isValid) {
    throw new AuthError(ErrorCode.AUTH_MFA_INVALID, 'Invalid MFA token')
  }
  
  // Disable MFA
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
    },
  })
  
  // Log MFA deactivation
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'user.mfa.disabled',
      resource: `user:${userId}`,
    },
  })
}

export async function generateBackupCodes(userId: string): Promise<string[]> {
  // Generate 10 backup codes
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
  }
  
  // In production, these should be hashed and stored in the database
  // For now, we'll just return them
  
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'user.mfa.backup_codes_generated',
      resource: `user:${userId}`,
    },
  })
  
  return codes
}