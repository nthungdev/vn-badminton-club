import { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { deleteEvent, getEventById } from '@/firebase/firestore'
import { verifySession } from '@/lib/session'
import { isRoleMod } from '@/lib/utils/auth'
import {
  EVENT_NOT_FOUND_ERROR,
  EVENT_STARTED_ERROR,
  MISSING_REQUIRED_FIELDS,
  UNAUTHORIZED_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { editEvent } from '@/lib/db/events'
import AppError from '@/lib/AppError'
import { EditEventParams } from '@/firebase/definitions/event'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEventById(params.id)
    if (!event) {
      return createErrorResponse(EVENT_NOT_FOUND_ERROR, 404)
    }

    return Response.json({ event })
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse(UNAUTHORIZED_ERROR, 401)
  }

  const { id } = params

  try {
    const event = await getEventById(id)
    if (!event) {
      return createErrorResponse(EVENT_NOT_FOUND_ERROR, 404)
    }

    if (
      event.organizer.uid !== decodedIdToken.uid &&
      !(await isRoleMod(decodedIdToken.uid))
    ) {
      return createErrorResponse(UNAUTHORIZED_ERROR, 401)
    }

    await deleteEvent(id)
    console.info('Event deleted:', id)
    return createSuccessResponse()
  } catch (error) {
    console.error('Error leaving event:', error)
    return createErrorResponse(error, 500)
  }
}

interface EventEditRequest {
  title?: string
  startTimestamp?: number
  endTimestamp?: number
  slots?: number
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
  const { title, startTimestamp, endTimestamp, slots }: EventEditRequest =
    await request.json()

  if (!eventId || !title || !startTimestamp || !endTimestamp || !slots) {
    return createErrorResponse(MISSING_REQUIRED_FIELDS, 400)
  }

  const updateEvent: EditEventParams = {
    title,
    startTimestamp: new Date(startTimestamp),
    endTimestamp: new Date(endTimestamp),
    slots,
  }

  try {
    await editEvent(
      eventId,
      updateEvent,
      decodedIdToken.uid,
      decodedIdToken.role
    )
    console.info('Event edited:', eventId)
    return createSuccessResponse()
  } catch (error) {
    if (error instanceof AppError) {
      let statusCode = 400
      switch (error.message) {
        case EVENT_NOT_FOUND_ERROR:
          statusCode = 404
          break
        case EVENT_STARTED_ERROR:
        case UNAUTHORIZED_ERROR:
          statusCode = 403
          break
        case UNKNOWN_ERROR:
        default:
          statusCode = 400
      }
      return createErrorResponse(error.message, statusCode)
    }
    console.error('Error updating event:', error)
    return createErrorResponse(error, 500)
  }
}
