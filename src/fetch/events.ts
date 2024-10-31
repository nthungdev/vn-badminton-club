import { EventsGetResponse } from '@/app/api/events/types'
import AppError from '@/lib/AppError'
import { HomeViewEvent } from '@/firebase/definitions/event'
import { UNKNOWN_ERROR } from '@/constants/errorMessages'
import { EventsAddGuestResponse } from '@/app/api/events/[id]/addGuest/type'
import { EventsKickGuestResponse } from '@/app/api/events/[id]/kickGuest/type'

function formatHomeViewEvents(events: HomeViewEvent[]) {
  return events.map((e) => ({
    ...e,
    startTimestamp: new Date(e.startTimestamp),
    endTimestamp: new Date(e.endTimestamp),
  })) as HomeViewEvent[]
}

export async function getEvents({
  filter,
  limit,
  startAfter,
}: {
  filter: 'joined' | 'new' | 'past'
  limit: number
  /** unix timestamp */
  startAfter?: number
}) {
  try {
    const params = new URLSearchParams()
    params.append('filter', filter)
    params.append('limit', limit.toString())
    if (startAfter) params.append('startAfter', startAfter?.toString() || '')

    const url = new URL(`/api/events`, window.location.origin)
    url.search = params.toString()

    const response: EventsGetResponse = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache',
    }).then((r) => r.json())
    if (!response.success) {
      throw new AppError(response.error.message)
    }

    return formatHomeViewEvents(response.data.events)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting events:', error)
    throw new AppError(UNKNOWN_ERROR)
  }
}

export async function joinEvent(eventId: string) {
  const url = `/api/events/${eventId}/join`

  try {
    const response: EventsGetResponse = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.json())
    if (!response.success) {
      throw new AppError(response.error.message)
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error joining event:', error)
    throw new AppError(UNKNOWN_ERROR)
  }
}

export async function leaveEvent(eventId: string) {
  const url = `/api/events/${eventId}/leave`

  try {
    const response: EventsGetResponse = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.json())
    if (!response.success) {
      throw new AppError(response.error.message)
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(UNKNOWN_ERROR, error)
  }
}

export async function kick(eventId: string, uid: string) {
  const url = `/api/events/${eventId}/kick`

  try {
    const response: EventsGetResponse = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    }).then((r) => r.json())
    if (!response.success) {
      throw new AppError(response.error.message)
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(UNKNOWN_ERROR, error)
  }
}

export async function addGuest(eventId: string, displayName: string) {
  const url = `/api/events/${eventId}/addGuest`

  try {
    const response: EventsAddGuestResponse = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    }).then((r) => r.json())
    if (!response.success) {
      throw new AppError(response.error.message)
    }
    return response.data.guest
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(UNKNOWN_ERROR)
  }
}

export async function kickGuest(eventId: string, guestId: string) {
  const url = `/api/events/${eventId}/kickGuest`

  try {
    const response: EventsKickGuestResponse = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId }),
    }).then((r) => r.json())
    if (!response.success) {
      throw new AppError(response.error.message)
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(UNKNOWN_ERROR)
  }
}
