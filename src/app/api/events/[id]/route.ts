import { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { deleteEvent, getEventById, updateEvent } from '@/firebase/firestore'
import { verifySession } from '@/lib/session'
import { isRoleMod } from '@/lib/utils/auth'
import {
  EVENT_NOT_FOUND_ERROR,
  MISSING_REQUIRED_FIELDS,
  UNAUTHORIZED_ERROR,
} from '@/constants/errorMessages'

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

interface EventUpdateRequest {
  eventId?: string
  title?: string
  startTimestamp?: number
  endTimestamp?: number
  slots?: number
}

export async function PATCH(request: NextRequest) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse(UNAUTHORIZED_ERROR, 401)
  }

  const data: EventUpdateRequest = await request.json()

  if (
    !data.eventId ||
    !data.title ||
    !data.startTimestamp ||
    !data.endTimestamp ||
    !data.slots
  ) {
    return createErrorResponse(MISSING_REQUIRED_FIELDS, 400)
  }

  try {
    const event = await getEventById(data.eventId)
    if (!event) {
      return createErrorResponse(EVENT_NOT_FOUND_ERROR, 404)
    }
    if (
      event.organizer.uid !== decodedIdToken.uid &&
      !(await isRoleMod(decodedIdToken.uid))
    ) {
      return createErrorResponse(UNAUTHORIZED_ERROR, 401)
    }

    const updatedEvent = {
      title: data.title,
      startTimestamp: new Date(data.startTimestamp),
      endTimestamp: new Date(data.endTimestamp),
      slots: data.slots,
    }

    await updateEvent(data.eventId, updatedEvent)

    console.info('Event updated:', data.eventId)
    return createSuccessResponse()
  } catch (error) {
    console.error('Error updating event:', error)
    return createErrorResponse(error, 500)
  }
}
