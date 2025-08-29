export enum ErrorCode {
  // Authentication (1xxx)
  AUTH_INVALID_CREDENTIALS = 1001,
  AUTH_SESSION_EXPIRED = 1002,
  AUTH_MFA_REQUIRED = 1003,
  AUTH_MFA_INVALID = 1004,
  AUTH_EMAIL_NOT_VERIFIED = 1005,
  AUTH_INVITATION_INVALID = 1006,
  AUTH_INVITATION_EXPIRED = 1007,
  
  // Authorization (3xxx)
  PERMISSION_DENIED = 3001,
  RESOURCE_NOT_FOUND = 3404,
  ORGANIZATION_NOT_FOUND = 3405,
  USER_NOT_IN_ORGANIZATION = 3406,
  
  // Validation (4xxx)
  VALIDATION_ERROR = 4001,
  INVALID_INPUT = 4002,
  DOMAIN_NOT_ALLOWED = 4003,
  SEAT_LIMIT_EXCEEDED = 4004,
}

export class AuthError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ValidationError extends AuthError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, details)
    this.name = 'ValidationError'
  }
}

export class PermissionError extends AuthError {
  constructor(message: string = 'Permission denied', details?: any) {
    super(ErrorCode.PERMISSION_DENIED, message, details)
    this.name = 'PermissionError'
  }
}