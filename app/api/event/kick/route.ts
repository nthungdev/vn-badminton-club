import { createErrorResponse } from '@/lib/apiResponse'
import { getEventById, leaveEvent } from '@/lib/firebase/firestore'
import { verifySession } from '@/lib/session'
import { isRoleMod } from '@/lib/utils/auth'
import { NextRequest } from 'next/server'

interface EventParticipantKickRequest {
  uid?: string
  eventId?: string
}

export async function PATCH(request: NextRequest) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const data: EventParticipantKickRequest = await request.json()

  if (!data.eventId || !data.uid) {
    return createErrorResponse('Missing eventId or uid', 400)
  }

  try {
    const event = await getEventById(data.eventId)
    if (!event) {
      return createErrorResponse('Event not found', 404)
    }

    // Check if the user is the event creator
    // Check if the user a mod
    if (
      event.organizer.uid !== decodedIdToken.uid &&
      !(await isRoleMod(decodedIdToken.uid))
    ) {
      return createErrorResponse('Unauthorized', 401)
    }

    await leaveEvent(data.uid, data.eventId)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error leaving event:', error)
    return createErrorResponse(error, 500)
  }
}
