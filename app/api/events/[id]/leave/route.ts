import { createErrorResponse } from '@/lib/apiResponse'
import { leaveEvent } from '@/lib/firebase/firestore'
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
    // TODO make sure now is not 8 hrs before the event
    await leaveEvent(decodedIdToken.uid, id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error leaving event:', error)
    return createErrorResponse(error, 500)
  }
}
