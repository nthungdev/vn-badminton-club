import { createErrorResponse } from '@/lib/apiResponse'
import {
  deleteEvent,
  getEventById,
  updateEvent,
} from '@/lib/firebase/firestore'
import { verifySession } from '@/lib/session'
import { isRoleMod } from '@/lib/utils/auth'
import { NextRequest } from 'next/server'

interface EventDeleteRequest {
  eventId?: string
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
    return createErrorResponse('Unauthorized', 401)
  }

  const data: EventUpdateRequest = await request.json()

  if (!data.eventId) {
    return createErrorResponse('Missing eventId', 400)
  }

  if (
    !data.title ||
    !data.startTimestamp ||
    !data.endTimestamp ||
    !data.slots
  ) {
    return createErrorResponse('Missing required fields', 400)
  }

  try {
    const event = await getEventById(data.eventId)
    if (!event) {
      return createErrorResponse('Event not found', 404)
    }
    if (
      event.organizer.uid !== decodedIdToken.uid &&
      !(await isRoleMod(decodedIdToken.uid))
    ) {
      return createErrorResponse('Unauthorized', 401)
    }

    const updatedEvent = {
      title: data.title,
      startTimestamp: new Date(data.startTimestamp),
      endTimestamp: new Date(data.endTimestamp),
      slots: data.slots,
    }

    await updateEvent(data.eventId, updatedEvent)

    console.log('Event updated:', data.eventId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error updating event:', error)
    return createErrorResponse(error, 500)
  }
}

export async function DELETE(request: NextRequest) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const data: EventDeleteRequest = await request.json()

  if (!data.eventId) {
    return createErrorResponse('Missing eventId', 400)
  }

  try {
    const event = await getEventById(data.eventId)
    if (!event) {
      return createErrorResponse('Event not found', 404)
    }

    if (
      event.organizer.uid !== decodedIdToken.uid &&
      !(await isRoleMod(decodedIdToken.uid))
    ) {
      return createErrorResponse('Unauthorized', 401)
    }

    await deleteEvent(data.eventId)
    console.log('Event deleted:', data.eventId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error leaving event:', error)
    return createErrorResponse(error, 500)
  }
}
