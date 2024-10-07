type AuthErrorName = 'ROLE_INVALID' | 'ROLE_SET_ERROR'

const AuthErrorMessages: Record<AuthErrorName, string> = {
  ROLE_INVALID: 'Role is invalid.',
  ROLE_SET_ERROR: 'Failed to set role.',
}

class AuthError extends Error {
  name: AuthErrorName

  constructor(name: AuthErrorName, message: string, cause?: unknown) {
    super()
    this.name = name
    this.message = message
    this.cause = cause
  }
}

function createAuthError(name: AuthErrorName, cause?: unknown): AuthError {
  return new AuthError(name, AuthErrorMessages[name], cause)
}

export { AuthError, createAuthError }
