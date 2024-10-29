import {
  EVENT_LATE_LEAVE_ERROR,
  EVENT_NOT_FOUND_ERROR,
  EVENT_STARTED_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import AppError from '@/lib/AppError'
import { leaveEvent } from '@/lib/db/events'
import { verifySession } from '@/lib/session'
import { NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const { id } = params

  try {
    await leaveEvent(decodedIdToken.uid, id, decodedIdToken.role)
    return createSuccessResponse()
  } catch (error) {
    if (error instanceof AppError) {
      let statusCode = 400
      switch (error.message) {
        case EVENT_NOT_FOUND_ERROR:
          statusCode = 404
          break
        case EVENT_LATE_LEAVE_ERROR:
        case EVENT_STARTED_ERROR:
          statusCode = 403
        case UNKNOWN_ERROR:
        default:
          statusCode = 400
      }
      return createErrorResponse(error.message, statusCode)
    }
    return createErrorResponse(error, 500)
  }
}
