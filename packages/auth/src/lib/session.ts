import { nanoid } from 'nanoid'
import jwt from 'jsonwebtoken'
import { prisma, Session, User } from '@reform-one/database'
import { AuthError, ErrorCode } from './errors'

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const SESSION_REFRESH_THRESHOLD = 15 * 60 * 1000 // 15 minutes

export interface SessionData {
  userId: string
  sessionId: string
  expiresAt: Date
}

export async function createSession(userId: string): Promise<Session> {
  const sessionToken = nanoid(32)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  
  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: expiresAt,
    },
  })
  
  return session
}

export async function validateSession(sessionToken: string): Promise<SessionData | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          organizations: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
  })
  
  if (!session) {
    return null
  }
  
  // Check if session expired
  if (session.expires < new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    })
    return null
  }
  
  // Refresh session if close to expiry
  const timeUntilExpiry = session.expires.getTime() - Date.now()
  if (timeUntilExpiry < SESSION_REFRESH_THRESHOLD) {
    const newExpiry = new Date(Date.now() + SESSION_DURATION)
    await prisma.session.update({
      where: { id: session.id },
      data: { expires: newExpiry },
    })
    session.expires = newExpiry
  }
  
  return {
    userId: session.userId,
    sessionId: session.id,
    expiresAt: session.expires,
  }
}

export async function invalidateSession(sessionToken: string): Promise<void> {
  await prisma.session.delete({
    where: { sessionToken },
  }).catch(() => {
    // Session might not exist, that's ok
  })
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

export function createJWT(payload: any, secret: string, expiresIn: string = '24h'): string {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
}

export function verifyJWT(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret)
  } catch (error) {
    throw new AuthError(ErrorCode.AUTH_SESSION_EXPIRED, 'Invalid or expired token')
  }
}

export async function getUserFromSession(sessionToken: string): Promise<User | null> {
  const sessionData = await validateSession(sessionToken)
  if (!sessionData) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: sessionData.userId },
  })
  
  return user
}