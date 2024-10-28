import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { getEventById } from '@/firebase/firestore'
import { verifySession } from '@/lib/session'
import { NextRequest } from 'next/server'
import {
  EVENT_GUEST_NOT_FOUND_ERROR,
  EVENT_NOT_FOUND_ERROR,
  EVENT_STARTED_ERROR,
  UNAUTHORIZED_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { kickGuest } from '@/lib/events'
import AppError from '@/lib/AppError'

interface EventGuestKickRequest {
  guestId: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse(UNAUTHORIZED_ERROR, 401)
  }

  const { id: eventId } = params
  const data: EventGuestKickRequest = await request.json()

  if (!data.guestId) {
    return createErrorResponse('Missing guestId.', 400)
  }

  try {
    const event = await getEventById(eventId)
    if (!event) {
      return createErrorResponse(EVENT_NOT_FOUND_ERROR, 404)
    }

    await kickGuest(
      eventId,
      data.guestId,
      decodedIdToken.uid,
      decodedIdToken.role
    )
    return createSuccessResponse()
  } catch (error) {
    if (error instanceof AppError) {
      let statusCode = 400
      switch (error.message) {
        case EVENT_GUEST_NOT_FOUND_ERROR:
        case EVENT_NOT_FOUND_ERROR:
          statusCode = 404
          break
        case EVENT_STARTED_ERROR:
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
