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
    { error: { name, message } },
    { status }
  )
}

function createCustomErrorResponse(error: object, status: number) {
  return Response.json({ error }, { status })
}

export { createErrorResponse, createCustomErrorResponse }
