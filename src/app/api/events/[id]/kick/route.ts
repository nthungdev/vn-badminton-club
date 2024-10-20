import { createErrorResponse } from '@/src/lib/apiResponse'
import { getEventById, leaveEvent } from '@/src/firebase/firestore'
import { verifySession } from '@/src/lib/session'
import { isRoleMod } from '@/src/lib/utils/auth'
import { NextRequest } from 'next/server'

interface EventParticipantKickRequest {
  uid?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const data: EventParticipantKickRequest = await request.json()

  const { id: eventId } = params

  if (!data.uid) {
    return createErrorResponse('Missing user uid', 400)
  }

  try {
    const event = await getEventById(eventId)
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

    await leaveEvent(data.uid, eventId)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error leaving event:', error)
    return createErrorResponse(error, 500)
  }
}
