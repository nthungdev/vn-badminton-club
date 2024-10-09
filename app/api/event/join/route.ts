import { createErrorResponse } from '@/lib/apiResponse'
import { joinEvent } from '@/lib/firebase/firestore'
import { verifySession } from '@/lib/session'
import { NextRequest } from 'next/server'

interface EventJoinPostRequest {
  eventId?: string
}

export async function POST(request: NextRequest) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const data: EventJoinPostRequest = await request.json()

  if (!data.eventId) {
    return createErrorResponse('Missing eventId', 400)
  }

  try {
    await joinEvent(decodedIdToken.uid, data.eventId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error joining event:', error)
    return createErrorResponse(error, 500)
  }
}
