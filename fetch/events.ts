import { EventsGetResponse } from '@/app/api/events/types'
import AppError from '@/lib/AppError'

async function getNewEvents() {
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

    return response.data.events
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting new events:', error)
    throw new AppError('Error', 'Something went wrong')
  }
}

async function getPastEvents() {
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

    return response.data.events
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.error('Error getting past events:', error)
    throw new AppError('Error', 'Something went wrong')
  }
}

export { getNewEvents, getPastEvents }
