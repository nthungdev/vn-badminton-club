import { createErrorResponse } from '@/lib/apiResponse'
import { leaveEvent } from '@/lib/firebase/firestore'
import { verifyIdToken } from '@/lib/session'
import { NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifyIdToken()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const { id } = params

  try {
    await leaveEvent(decodedIdToken.uid, id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error leaving event:', error)
    return createErrorResponse(error, 500)
  }
}
