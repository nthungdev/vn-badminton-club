import { EventsGetResponse } from '@/app/api/events/types'
import AppError from '@/lib/AppError'
import { HomeViewEvent } from '@/lib/firebase/definitions/event'

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
      throw new AppError('Error', 'Error getting joined events')
    }

    return formatHomeViewEvents(response.data.events)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting joined events:', error)
    throw new AppError('Error', 'Something went wrong')
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
      throw new AppError('Error', 'Error getting new events')
    }

    return formatHomeViewEvents(response.data.events)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting new events:', error)
    throw new AppError('Error', 'Something went wrong')
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
      throw new AppError('Error', 'Error getting past events')
    }

    return formatHomeViewEvents(response.data.events)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting past events:', error)
    throw new AppError('Error', 'Something went wrong')
  }
}
