import { createErrorResponse } from '@/lib/apiResponse'
import { joinEvent } from '@/lib/firebase/firestore'
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
    await joinEvent(decodedIdToken.uid, id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error joining event:', error)
    return createErrorResponse(error, 500)
  }
}
