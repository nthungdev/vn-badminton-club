import { createErrorResponse } from '@/lib/apiResponse'
import { addGuest } from '@/firebase/firestore'
import { verifySession } from '@/lib/session'
import { NextRequest } from 'next/server'

interface EventGuestAddRequest {
  name?: string
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
  const data: EventGuestAddRequest = await request.json()

  if (!data.name) {
    return createErrorResponse('Missing guest name', 400)
  }

  try {
    await addGuest(eventId, decodedIdToken.uid, data.name)
    return Response.json({ success: true })
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}
