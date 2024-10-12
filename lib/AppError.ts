export default class AppError extends Error {
  name: string

  constructor(name: string, message: string, cause?: unknown) {
    super()
    this.name = name
    this.message = message
    this.cause = cause
  }
}

