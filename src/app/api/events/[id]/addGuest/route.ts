import { createErrorResponse } from '@/lib/apiResponse'
import { joinEvent } from '@/firebase/firestore'
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

  const { id: eventId } = params

  try {
    // TODO make sure the event is not full
    // TODO make sure the event is not past
    await joinEvent(decodedIdToken.uid, eventId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error joining event:', error)
    return createErrorResponse(error, 500)
  }
}
