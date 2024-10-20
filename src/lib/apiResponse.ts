type ErrorApiResponse = {
  success: false
  error: {
    name: string
    message: string
  }
}

type SuccessApiResponse<T> = {
  success: true
  data: T
}

type ApiResponse<T> = ErrorApiResponse | SuccessApiResponse<T>

function createSuccessResponse(data: object, status: number = 200) {
  return Response.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

function createErrorResponse(error: Error | unknown, status: number) {
  let name: string
  let message: string

  if (error instanceof Error) {
    name = error.name
    message = error.message
  } else if (typeof error === 'string') {
    name = 'UnknownError'
    message = error
  } else {
    name = 'UnknownError'
    message = 'An unknown error occurred'
  }

  return Response.json(
    {
      success: false,
      error: { name, message },
    },
    { status }
  )
}

function createCustomErrorResponse(error: object, status: number) {
  return Response.json({ error }, { status })
}

export { createSuccessResponse, createErrorResponse, createCustomErrorResponse }
export type { ErrorApiResponse as ErrorResponse, SuccessApiResponse as SuccessResponse, ApiResponse }
