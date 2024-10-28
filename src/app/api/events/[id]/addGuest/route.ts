import {
  EVENT_FULL_ERROR,
  EVENT_LATE_JOIN_ERROR,
  EVENT_NOT_FOUND_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import AppError from '@/lib/AppError'
import { addGuest } from '@/lib/db/events'
import { verifySession } from '@/lib/session'
import { NextRequest } from 'next/server'

interface EventGuestAddRequest {
  displayName?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const { id: eventId } = params
  const data: EventGuestAddRequest = await request.json()

  if (!data.displayName) {
    return createErrorResponse('Missing guest displayName', 400)
  }

  try {
    const guest = await addGuest(
      eventId,
      decodedIdToken.uid,
      decodedIdToken.name,
      data.displayName,
      decodedIdToken.role
    )
    return createSuccessResponse({ guest })
  } catch (error) {
    console.error('Error adding guest to event:', {
      error,
      data,
      decodedIdToken,
    })
    if (error instanceof AppError) {
      let statusCode = 400
      switch (error.message) {
        case EVENT_NOT_FOUND_ERROR:
          statusCode = 404
          break
        case EVENT_FULL_ERROR:
        case EVENT_LATE_JOIN_ERROR:
          statusCode = 403
          break
        case UNKNOWN_ERROR:
        default:
          statusCode = 400
      }
      return createErrorResponse(error.message, statusCode)
    }
    return createErrorResponse(error, 500)
  }
}
