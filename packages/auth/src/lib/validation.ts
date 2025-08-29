import { z } from 'zod'

export const emailSchema = z.string().email().toLowerCase()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  organizationName: z.string().min(2, 'Organization name is required'),
})

export const inviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['ADMIN', 'MEMBER', 'DEPARTMENT_MANAGER']),
  departmentId: z.string().optional(),
})

export const mfaTokenSchema = z.object({
  token: z.string().length(6).regex(/^\d+$/, 'Token must be 6 digits'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type InviteInput = z.infer<typeof inviteSchema>
export type MfaTokenInput = z.infer<typeof mfaTokenSchema>