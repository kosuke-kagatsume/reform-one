import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

// Request schemas
export const LoginRequestSchema = z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  password: z.string().min(1).openapi({ example: 'SecurePass123!' }),
  organizationId: z.string().optional().openapi({ example: 'org_123' }),
}).openapi('LoginRequest')

export const SignupRequestSchema = z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  password: z.string().min(8).openapi({ example: 'SecurePass123!' }),
  name: z.string().optional().openapi({ example: 'John Doe' }),
  organizationName: z.string().openapi({ example: 'Acme Corp' }),
}).openapi('SignupRequest')

export const InviteRequestSchema = z.object({
  email: z.string().email().openapi({ example: 'newuser@example.com' }),
  role: z.enum(['ADMIN', 'MEMBER', 'DEPARTMENT_MANAGER']).openapi({ example: 'MEMBER' }),
  departmentId: z.string().optional(),
}).openapi('InviteRequest')

export const AcceptInviteRequestSchema = z.object({
  token: z.string().openapi({ example: 'inv_abc123' }),
  password: z.string().min(8).optional().openapi({ example: 'SecurePass123!' }),
  name: z.string().optional().openapi({ example: 'Jane Doe' }),
}).openapi('AcceptInviteRequest')

export const MfaSetupRequestSchema = z.object({
  userId: z.string().openapi({ example: 'user_123' }),
}).openapi('MfaSetupRequest')

export const MfaConfirmRequestSchema = z.object({
  userId: z.string().openapi({ example: 'user_123' }),
  token: z.string().length(6).openapi({ example: '123456' }),
}).openapi('MfaConfirmRequest')

export const MfaLoginRequestSchema = z.object({
  userId: z.string().openapi({ example: 'user_123' }),
  token: z.string().length(6).openapi({ example: '123456' }),
  organizationId: z.string().optional().openapi({ example: 'org_123' }),
}).openapi('MfaLoginRequest')

// Response schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  emailVerified: z.boolean(),
  mfaEnabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).openapi('User')

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).openapi('Organization')

export const SessionSchema = z.object({
  id: z.string(),
  sessionToken: z.string(),
  expires: z.string().datetime(),
}).openapi('Session')

export const LoginResponseSchema = z.object({
  user: UserSchema,
  session: SessionSchema,
  organizations: z.array(OrganizationSchema),
  mfaRequired: z.boolean().optional(),
}).openapi('LoginResponse')

export const SignupResponseSchema = z.object({
  user: UserSchema,
  organization: OrganizationSchema,
  session: SessionSchema,
}).openapi('SignupResponse')

export const InviteResponseSchema = z.object({
  token: z.string(),
  inviteUrl: z.string().url(),
  expiresAt: z.string().datetime(),
}).openapi('InviteResponse')

export const MfaSetupResponseSchema = z.object({
  secret: z.string(),
  qrCode: z.string(),
}).openapi('MfaSetupResponse')

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
    details: z.any().optional(),
  }),
}).openapi('ErrorResponse')

// API paths
export const authPaths = {
  '/api/auth/signup': {
    post: {
      tags: ['Authentication'],
      summary: 'Create a new account',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: SignupRequestSchema,
          },
        },
      },
      responses: {
        201: {
          description: 'Account created successfully',
          content: {
            'application/json': {
              schema: SignupResponseSchema,
            },
          },
        },
        400: {
          description: 'Invalid input',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login to account',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: LoginRequestSchema,
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: LoginResponseSchema,
            },
          },
        },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
        403: {
          description: 'MFA required',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    },
  },
  '/api/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout from account',
      security: [{ sessionToken: [] }],
      responses: {
        200: {
          description: 'Logout successful',
        },
      },
    },
  },
  '/api/auth/invite': {
    post: {
      tags: ['Authentication'],
      summary: 'Send invitation to join organization',
      security: [{ sessionToken: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: InviteRequestSchema,
          },
        },
      },
      responses: {
        201: {
          description: 'Invitation sent',
          content: {
            'application/json': {
              schema: InviteResponseSchema,
            },
          },
        },
        403: {
          description: 'Permission denied',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    },
  },
  '/api/auth/invite/accept': {
    post: {
      tags: ['Authentication'],
      summary: 'Accept invitation',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: AcceptInviteRequestSchema,
          },
        },
      },
      responses: {
        200: {
          description: 'Invitation accepted',
          content: {
            'application/json': {
              schema: SignupResponseSchema,
            },
          },
        },
        400: {
          description: 'Invalid or expired invitation',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    },
  },
  '/api/auth/mfa/setup': {
    post: {
      tags: ['Multi-Factor Authentication'],
      summary: 'Setup MFA for account',
      security: [{ sessionToken: [] }],
      responses: {
        200: {
          description: 'MFA setup initiated',
          content: {
            'application/json': {
              schema: MfaSetupResponseSchema,
            },
          },
        },
      },
    },
  },
  '/api/auth/mfa/confirm': {
    post: {
      tags: ['Multi-Factor Authentication'],
      summary: 'Confirm MFA setup',
      security: [{ sessionToken: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: MfaConfirmRequestSchema,
          },
        },
      },
      responses: {
        200: {
          description: 'MFA enabled',
        },
        400: {
          description: 'Invalid token',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    },
  },
  '/api/auth/mfa/login': {
    post: {
      tags: ['Multi-Factor Authentication'],
      summary: 'Complete login with MFA',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: MfaLoginRequestSchema,
          },
        },
      },
      responses: {
        200: {
          description: 'MFA login successful',
          content: {
            'application/json': {
              schema: LoginResponseSchema,
            },
          },
        },
        401: {
          description: 'Invalid MFA token',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    },
  },
}