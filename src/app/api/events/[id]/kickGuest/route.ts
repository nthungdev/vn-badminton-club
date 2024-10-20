import { createErrorResponse } from '@/lib/apiResponse'
import { getEventById, kickGuest } from '@/firebase/firestore'
import { verifySession } from '@/lib/session'
import { NextRequest } from 'next/server'
import { isRoleMod } from '@/lib/utils/auth'
import { EVENT_NOT_FOUND_ERROR } from '@/constants/errorMessages'

interface EventGuestKickRequest {
  guestId: string
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
  const data: EventGuestKickRequest = await request.json()

  if (!data.guestId) {
    return createErrorResponse('Missing guestId', 400)
  }

  try {
    const event = await getEventById(eventId)
    if (!event) {
      return createErrorResponse(EVENT_NOT_FOUND_ERROR, 404)
    }

    // Check if the user is the event creator
    // Check if the user a mod
    if (
      event.organizer.uid !== decodedIdToken.uid &&
      !(await isRoleMod(decodedIdToken.uid))
    ) {
      return createErrorResponse('Unauthorized', 401)
    }

    await kickGuest(eventId, data.guestId)
    return Response.json({ success: true })
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}
