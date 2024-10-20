import { EventsGetResponse } from '@/src/app/api/events/types'
import AppError from '@/src/lib/AppError'
import { HomeViewEvent } from '@/src/firebase/definitions/event'

function formatHomeViewEvents(events: HomeViewEvent[]) {
  return events.map((e) => ({
    ...e,
    startTimestamp: new Date(e.startTimestamp),
    endTimestamp: new Date(e.endTimestamp),
  })) as HomeViewEvent[]
}

export async function getJoinedEvents() {
  try {
    const response: EventsGetResponse = await fetch(
      '/api/events?filter=joined',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    ).then((r) => r.json())
    if (!response.success) {
      throw new AppError('Error getting joined events')
    }

    return formatHomeViewEvents(response.data.events)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting joined events:', error)
    throw new AppError('Something went wrong')
  }
}

export async function getNewEvents() {
  try {
    const response: EventsGetResponse = await fetch('/api/events?filter=new', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((r) => r.json())
    if (!response.success) {
      throw new AppError('Error getting new events')
    }

    return formatHomeViewEvents(response.data.events)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting new events:', error)
    throw new AppError('Something went wrong')
  }
}

export async function getPastEvents() {
  try {
    const response: EventsGetResponse = await fetch('/api/events?filter=past', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((r) => r.json())
    if (!response.success) {
      throw new AppError(response.error.message)
    }

    return formatHomeViewEvents(response.data.events)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting past events:', error)
    throw new AppError('Something went wrong')
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
    throw new AppError('Something went wrong')
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
    throw new AppError('Something went wrong', error)
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
    throw new AppError('Something went wrong', error)
  }
}
