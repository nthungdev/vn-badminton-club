import { createErrorResponse } from '@/src/lib/apiResponse'
import { joinEvent } from '@/src/firebase/firestore'
import { verifySession } from '@/src/lib/session'
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
    // TODO make sure the event is not full
    // TODO make sure the event is not past
    await joinEvent(decodedIdToken.uid, id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error joining event:', error)
    return createErrorResponse(error, 500)
  }
}