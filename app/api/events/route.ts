import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { HomeViewEvent } from '@/lib/firebase/definitions/event'
import { getNewEvents, getPastEvents } from '@/lib/firebase/firestore'
import { NextRequest } from 'next/server'

const DEFAULT_GET_LIMIT = 10

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
      default:
        return createErrorResponse('Invalid filter query parameter', 400)
    }
    return createSuccessResponse({ events }, 200)
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}
