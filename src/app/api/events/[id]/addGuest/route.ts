import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { addGuest } from '@/firebase/firestore'
import { verifySession } from '@/lib/session'
import { NextRequest } from 'next/server'

interface EventGuestAddRequest {
  displayName?: string
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

  if (!data.displayName) {
    return createErrorResponse('Missing guest displayName', 400)
  }

  try {
    const guest = await addGuest(eventId, decodedIdToken.uid, data.displayName)
    return createSuccessResponse({ guest })
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}
