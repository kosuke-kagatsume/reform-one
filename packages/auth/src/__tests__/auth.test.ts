import { prisma } from '@reform-one/database'
import {
  signup,
  login,
  verifyEmail,
  hashPassword,
  verifyPassword,
} from '../lib/auth'
import { AuthError, ErrorCode } from '../lib/errors'

// Mock Prisma
jest.mock('@reform-one/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    organization: {
      create: jest.fn(),
    },
    userOrganization: {
      create: jest.fn(),
    },
    organizationSettings: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Role: {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  },
}))

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Password Hashing', () => {
    it('should hash and verify password correctly', async () => {
      const password = 'SecurePass123!'
      const hash = await hashPassword(password)
      
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50)
      
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
      
      const isInvalid = await verifyPassword('WrongPassword', hash)
      expect(isInvalid).toBe(false)
    })
  })

  describe('Signup', () => {
    it('should create a new user and organization', async () => {
      const signupData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        organizationName: 'Test Org',
      }

      const mockUser = {
        id: 'user_123',
        email: signupData.email,
        name: signupData.name,
        emailVerified: false,
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockOrg = {
        id: 'org_123',
        name: signupData.organizationName,
        slug: 'test-org-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          organization: {
            create: jest.fn().mockResolvedValue(mockOrg),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          userOrganization: {
            create: jest.fn(),
          },
          organizationSettings: {
            create: jest.fn(),
          },
          auditLog: {
            create: jest.fn(),
          },
        })
      })
      ;(prisma.session.create as jest.Mock).mockResolvedValue({
        id: 'session_123',
        sessionToken: 'token_123',
        userId: mockUser.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      const result = await signup(signupData)

      expect(result.user).toMatchObject({
        email: signupData.email,
        name: signupData.name,
      })
      expect(result.organization).toMatchObject({
        name: signupData.organizationName,
      })
      expect(result.session).toBeDefined()
    })

    it('should throw error if email already exists', async () => {
      const signupData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        organizationName: 'Test Org',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing_user',
        email: signupData.email,
      })

      await expect(signup(signupData)).rejects.toThrow(AuthError)
      await expect(signup(signupData)).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Email already registered',
      })
    })
  })

  describe('Login', () => {
    it('should login user with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      }

      const hashedPassword = await hashPassword(loginData.password)
      const mockUser = {
        id: 'user_123',
        email: loginData.email,
        password: hashedPassword,
        emailVerified: true,
        mfaEnabled: false,
        organizations: [
          {
            organizationId: 'org_123',
            organization: {
              id: 'org_123',
              name: 'Test Org',
              slug: 'test-org',
            },
          },
        ],
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.session.create as jest.Mock).mockResolvedValue({
        id: 'session_123',
        sessionToken: 'token_123',
        userId: mockUser.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      const result = await login(loginData)

      expect(result.user.email).toBe(loginData.email)
      expect(result.session).toBeDefined()
      expect(result.organizations).toHaveLength(1)
    })

    it('should throw error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(login(loginData)).rejects.toThrow(AuthError)
      await expect(login(loginData)).rejects.toMatchObject({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      })
    })

    it('should require MFA if enabled', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      }

      const hashedPassword = await hashPassword(loginData.password)
      const mockUser = {
        id: 'user_123',
        email: loginData.email,
        password: hashedPassword,
        emailVerified: true,
        mfaEnabled: true,
        mfaSecret: 'secret123',
        organizations: [],
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      await expect(login(loginData)).rejects.toThrow(AuthError)
      await expect(login(loginData)).rejects.toMatchObject({
        code: ErrorCode.AUTH_MFA_REQUIRED,
        details: {
          userId: mockUser.id,
          mfaRequired: true,
        },
      })
    })

    it('should require email verification', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      }

      const hashedPassword = await hashPassword(loginData.password)
      const mockUser = {
        id: 'user_123',
        email: loginData.email,
        password: hashedPassword,
        emailVerified: false,
        mfaEnabled: false,
        organizations: [],
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      await expect(login(loginData)).rejects.toThrow(AuthError)
      await expect(login(loginData)).rejects.toMatchObject({
        code: ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
      })
    })
  })

  describe('Email Verification', () => {
    it('should verify user email', async () => {
      const userId = 'user_123'
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        emailVerified: true,
      }

      ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      const result = await verifyEmail(userId)

      expect(result.emailVerified).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { emailVerified: true },
      })
    })
  })
})