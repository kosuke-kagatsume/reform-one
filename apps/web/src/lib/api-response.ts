import type { NextApiResponse } from 'next'

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export const ErrorCodes = {
  // 認証エラー (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  MFA_REQUIRED: 'MFA_REQUIRED',

  // 認可エラー (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // バリデーションエラー (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_CODE: 'INVALID_CODE',
  INVALID_PASSWORD: 'INVALID_PASSWORD',

  // リソースエラー (404)
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',

  // コンフリクトエラー (409)
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  MFA_ALREADY_ENABLED: 'MFA_ALREADY_ENABLED',
  MFA_NOT_ENABLED: 'MFA_NOT_ENABLED',

  // レート制限エラー (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // サーバーエラー (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

const errorStatusMap: Record<ErrorCode, number> = {
  // 401
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.INVALID_CREDENTIALS]: 401,
  [ErrorCodes.SESSION_EXPIRED]: 401,
  [ErrorCodes.MFA_REQUIRED]: 401,

  // 403
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,

  // 400
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.INVALID_CODE]: 400,
  [ErrorCodes.INVALID_PASSWORD]: 400,

  // 404
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.USER_NOT_FOUND]: 404,
  [ErrorCodes.TOKEN_NOT_FOUND]: 404,

  // 409
  [ErrorCodes.ALREADY_EXISTS]: 409,
  [ErrorCodes.MFA_ALREADY_ENABLED]: 409,
  [ErrorCodes.MFA_NOT_ENABLED]: 409,

  // 429
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,

  // 500
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
}

export function success<T>(res: NextApiResponse, data: T, message?: string, status = 200) {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  }
  return res.status(status).json(response)
}

export function error(
  res: NextApiResponse,
  code: ErrorCode,
  message: string,
  details?: unknown,
  statusOverride?: number
) {
  const status = statusOverride ?? errorStatusMap[code] ?? 500
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  }
  return res.status(status).json(response)
}

export function methodNotAllowed(res: NextApiResponse, allowed: string[]) {
  res.setHeader('Allow', allowed)
  return error(res, ErrorCodes.VALIDATION_ERROR, 'Method not allowed', { allowed }, 405)
}

export function unauthorized(res: NextApiResponse, message = '認証が必要です') {
  return error(res, ErrorCodes.UNAUTHORIZED, message)
}

export function forbidden(res: NextApiResponse, message = 'アクセス権限がありません') {
  return error(res, ErrorCodes.FORBIDDEN, message)
}

export function notFound(res: NextApiResponse, message = 'リソースが見つかりません') {
  return error(res, ErrorCodes.NOT_FOUND, message)
}

export function validationError(res: NextApiResponse, message: string, details?: unknown) {
  return error(res, ErrorCodes.VALIDATION_ERROR, message, details)
}

export function internalError(res: NextApiResponse, message = 'サーバーエラーが発生しました') {
  return error(res, ErrorCodes.INTERNAL_ERROR, message)
}
