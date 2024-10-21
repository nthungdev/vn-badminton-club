import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { HomeViewEvent } from '@/firebase/definitions/event'
import {
  getJoinedEvents,
  getNewEvents,
  getPastEvents,
} from '@/firebase/firestore'
import { verifySession } from '@/lib/session'
import { NextRequest } from 'next/server'

const DEFAULT_GET_LIMIT = 100

export async function GET(request: NextRequest) {
  const filter = request.nextUrl.searchParams.get('filter')
  const limit = request.nextUrl.searchParams.get('limit')
    ? parseInt(request.nextUrl.searchParams.get('limit') as string)
    : DEFAULT_GET_LIMIT

  if (!filter) {
    return createErrorResponse('Missing filter query parameter', 400)
  }

  try {
    let events: HomeViewEvent[] = []
    switch (filter) {
      case 'new':
        events = await getNewEvents({ limit })
        break
      case 'past':
        events = await getPastEvents({ limit })
        break
      case 'joined':
        const { decodedIdToken } = await verifySession()
        if (!decodedIdToken?.uid) {
          return createErrorResponse('Unauthorized', 401)
        }
        events = await getJoinedEvents(decodedIdToken.uid, { limit })
        break
      default:
        return createErrorResponse('Invalid filter query parameter', 400)
    }
    return createSuccessResponse({ events }, 200)
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}
