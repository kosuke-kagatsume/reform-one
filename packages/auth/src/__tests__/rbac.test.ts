import { prisma, Role } from '@reform-one/database'
import {
  hasPermission,
  getUserRole,
  enforcePermission,
  checkDomainRestriction,
  checkSeatLimit,
  isOrgAdmin,
  changeUserRole,
} from '../lib/rbac'
import { PermissionError, AuthError, ErrorCode } from '../lib/errors'

// Mock Prisma
jest.mock('@reform-one/database', () => ({
  prisma: {
    userOrganization: {
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    organizationSettings: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
  Role: {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  },
}))

describe('RBAC', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Permission Checking', () => {
    it('should grant admin full access', () => {
      const userContext = {
        userId: 'user_123',
        organizationId: 'org_123',
        role: 'ADMIN' as Role,
      }

      expect(hasPermission(userContext, 'users', 'delete')).toBe(true)
      expect(hasPermission(userContext, 'billing', 'update')).toBe(true)
      expect(hasPermission(userContext, 'anything', 'anything')).toBe(true)
    })

    it('should grant department manager department-level access', () => {
      const userContext = {
        userId: 'user_123',
        organizationId: 'org_123',
        role: 'DEPARTMENT_MANAGER' as Role,
        departmentId: 'dept_123',
      }

      expect(hasPermission(userContext, 'users', 'read', 'department')).toBe(true)
      expect(hasPermission(userContext, 'users', 'invite', 'department')).toBe(true)
      expect(hasPermission(userContext, 'content', 'create', 'department')).toBe(true)
      expect(hasPermission(userContext, 'users', 'delete', 'organization')).toBe(false)
      expect(hasPermission(userContext, 'billing', 'update')).toBe(false)
    })

    it('should grant member basic access', () => {
      const userContext = {
        userId: 'user_123',
        organizationId: 'org_123',
        role: 'MEMBER' as Role,
      }

      expect(hasPermission(userContext, 'users', 'read', 'own')).toBe(true)
      expect(hasPermission(userContext, 'content', 'read', 'organization')).toBe(true)
      expect(hasPermission(userContext, 'profile', 'update', 'own')).toBe(true)
      expect(hasPermission(userContext, 'users', 'delete')).toBe(false)
      expect(hasPermission(userContext, 'billing', 'update')).toBe(false)
    })
  })

  describe('Get User Role', () => {
    it('should return user role in organization', async () => {
      ;(prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        userId: 'user_123',
        organizationId: 'org_123',
        role: 'ADMIN',
      })

      const role = await getUserRole('user_123', 'org_123')
      expect(role).toBe('ADMIN')
    })

    it('should return null if user not in organization', async () => {
      ;(prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null)

      const role = await getUserRole('user_123', 'org_123')
      expect(role).toBeNull()
    })
  })

  describe('Enforce Permission', () => {
    it('should pass for valid permission', async () => {
      const userContext = {
        userId: 'user_123',
        organizationId: 'org_123',
        role: 'ADMIN' as Role,
      }

      await expect(
        enforcePermission(userContext, 'users', 'delete')
      ).resolves.toBeUndefined()
    })

    it('should throw for invalid permission', async () => {
      const userContext = {
        userId: 'user_123',
        organizationId: 'org_123',
        role: 'MEMBER' as Role,
      }

      await expect(
        enforcePermission(userContext, 'users', 'delete')
      ).rejects.toThrow(PermissionError)
    })
  })

  describe('Domain Restriction', () => {
    it('should allow email from allowed domain', async () => {
      ;(prisma.organizationSettings.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 'org_123',
        allowedDomains: ['example.com', 'company.com'],
      })

      const isAllowed = await checkDomainRestriction('user@example.com', 'org_123')
      expect(isAllowed).toBe(true)
    })

    it('should reject email from disallowed domain', async () => {
      ;(prisma.organizationSettings.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 'org_123',
        allowedDomains: ['example.com'],
      })

      const isAllowed = await checkDomainRestriction('user@other.com', 'org_123')
      expect(isAllowed).toBe(false)
    })

    it('should allow any email if no restriction', async () => {
      ;(prisma.organizationSettings.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 'org_123',
        allowedDomains: [],
      })

      const isAllowed = await checkDomainRestriction('user@any.com', 'org_123')
      expect(isAllowed).toBe(true)
    })
  })

  describe('Seat Limit', () => {
    it('should allow if under seat limit', async () => {
      ;(prisma.organizationSettings.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 'org_123',
        seatLimit: 10,
      })
      ;(prisma.userOrganization.count as jest.Mock).mockResolvedValue(5)

      const hasSeats = await checkSeatLimit('org_123')
      expect(hasSeats).toBe(true)
    })

    it('should reject if at seat limit', async () => {
      ;(prisma.organizationSettings.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 'org_123',
        seatLimit: 10,
      })
      ;(prisma.userOrganization.count as jest.Mock).mockResolvedValue(10)

      const hasSeats = await checkSeatLimit('org_123')
      expect(hasSeats).toBe(false)
    })

    it('should allow if no seat limit', async () => {
      ;(prisma.organizationSettings.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 'org_123',
        seatLimit: null,
      })

      const hasSeats = await checkSeatLimit('org_123')
      expect(hasSeats).toBe(true)
    })
  })

  describe('Change User Role', () => {
    it('should allow admin to change roles', async () => {
      // Mock performer as admin
      ;(prisma.userOrganization.findUnique as jest.Mock)
        .mockResolvedValueOnce({ role: 'ADMIN' }) // isOrgAdmin check
        .mockResolvedValueOnce({ role: 'MEMBER' }) // getUserRole check
      
      ;(prisma.userOrganization.count as jest.Mock).mockResolvedValue(2)
      ;(prisma.userOrganization.update as jest.Mock).mockResolvedValue({})
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      await changeUserRole('user_123', 'org_123', 'ADMIN' as Role, 'admin_123')

      expect(prisma.userOrganization.update).toHaveBeenCalled()
      expect(prisma.auditLog.create).toHaveBeenCalled()
    })

    it('should prevent removing last admin', async () => {
      // Mock performer as admin
      ;(prisma.userOrganization.findUnique as jest.Mock)
        .mockResolvedValueOnce({ role: 'ADMIN' }) // isOrgAdmin check
        .mockResolvedValueOnce({ role: 'ADMIN' }) // getUserRole check
      
      ;(prisma.userOrganization.count as jest.Mock).mockResolvedValue(1) // Only 1 admin

      await expect(
        changeUserRole('user_123', 'org_123', 'MEMBER' as Role, 'admin_123')
      ).rejects.toThrow(AuthError)
      await expect(
        changeUserRole('user_123', 'org_123', 'MEMBER' as Role, 'admin_123')
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Cannot remove the last admin from organization',
      })
    })

    it('should prevent non-admin from changing roles', async () => {
      // Mock performer as member
      ;(prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({ role: 'MEMBER' })

      await expect(
        changeUserRole('user_123', 'org_123', 'ADMIN' as Role, 'member_123')
      ).rejects.toThrow(PermissionError)
    })
  })
})