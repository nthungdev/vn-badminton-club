export default class AppError extends Error {
  name: string

  constructor(message: string, cause?: unknown) {
    super()
    this.name = 'AppError'
    this.message = message
    this.cause = cause
  }
}

