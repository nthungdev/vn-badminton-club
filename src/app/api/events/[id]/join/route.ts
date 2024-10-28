import { NextRequest } from 'next/server'
import {
  EVENT_FULL_ERROR,
  EVENT_LATE_JOIN_ERROR,
  EVENT_NOT_FOUND_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import AppError from '@/lib/AppError'
import { joinEvent } from '@/lib/db/events'
import { verifySession } from '@/lib/session'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const { id: eventId } = params

  try {
    await joinEvent(decodedIdToken.uid, eventId)
    return createSuccessResponse()
  } catch (error) {
    console.error('Error joining event:', error)
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
