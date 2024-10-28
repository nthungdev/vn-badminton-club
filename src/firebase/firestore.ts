'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import {
  CreatedEvent,
  CreateEventParams,
  EventParticipant,
  FirestoreEvent,
} from './definitions/event'
import { COLLECTION_EVENTS } from './firestore.constant'
import { firestore } from './serverApp'
import AppError from '../lib/AppError'
import {
  EVENT_NOT_FOUND_ERROR,
  EVENT_ORGANIZER_NOT_FOUND_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { EventsCacheKey, getNodeCache } from '@/lib/cache'
import { getUserById } from '@/lib/authUtils'
import { DEFAULT_EVENT_LEAVE_CUTOFF } from '@/lib/utils/events'
import { eventReadConverter } from './utils'

const cache = getNodeCache('eventsCache')

const eventCollection = firestore.collection(COLLECTION_EVENTS)

async function getEventParticipantFromUid(uid: string) {
  const user = await getUserById(uid)
  if (!user) {
    throw new AppError('User not found')
  }
  const eventParticipant: EventParticipant = {
    uid: user.uid,
    displayName: user.displayName!,
  }
  return eventParticipant
}

export async function getJoinedEvents(
  uid: string,
  { limit }: { limit: number }
) {
  try {
    const snapshot = await eventCollection
      .withConverter(eventReadConverter)
      .where('participantIds', 'array-contains', uid)
      .orderBy('startTimestamp')
      .limit(limit)
      .get()
    return snapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error getting joined events:', error)
    throw new Error('Error getting joined events')
  }
}

export async function getNewEvents({ limit }: { limit: number }) {
  try {
    // if (cache.has(EventsCacheKey.NewEvents)) {
    //   return cache.get(EventsCacheKey.NewEvents) as HomeViewEvent[]
    // }

    const snapshot = await eventCollection
      .withConverter(eventReadConverter)
      .where('startTimestamp', '>=', new Date())
      .orderBy('startTimestamp')
      .limit(limit)
      .get()

    const events = snapshot.docs.map((doc) => doc.data())
    cache.set(EventsCacheKey.NewEvents, events)
    return events
  } catch (error) {
    console.error('Error getting events:', error)
    throw new Error('Error getting events')
  }
}

export async function getPastEvents({ limit }: { limit: number }) {
  try {
    // if (cache.has(EventsCacheKey.PastEvents)) {
    //   return cache.get(EventsCacheKey.PastEvents) as HomeViewEvent[]
    // }

    const snapshot = await eventCollection
      .withConverter(eventReadConverter)
      .where('startTimestamp', '<', new Date())
      .orderBy('startTimestamp', 'desc')
      .limit(limit)
      .get()

    const events = snapshot.docs.map((doc) => doc.data())
    cache.set(EventsCacheKey.PastEvents, events)
    return events
  } catch (error) {
    console.error('Error getting events:', error)
    throw new Error('Error getting events')
  }
}

export async function getEventById(eventId: string) {
  const eventsRef = eventCollection
    .withConverter(eventReadConverter)
    .doc(eventId)

  try {
    const { error, event } = await firestore.runTransaction(
      async (transaction) => {
        const doc = await transaction.get(eventsRef)
        const data = doc.data()
        if (!doc.exists || !data) {
          return { error: EVENT_NOT_FOUND_ERROR }
        }

        const participants: EventParticipant[] = []
        for (const uid of data.participantIds) {
          try {
            const eventParticipant = await getEventParticipantFromUid(uid)
            participants.push(eventParticipant)
          } catch (error) {
            console.error(
              `Cannot get event participant ${uid} in event ${eventId}`,
              { error }
            )
            continue
          }
        }

        const organizer =
          participants.find((p) => p.uid === data.createdBy) ||
          (await getEventParticipantFromUid(data.createdBy).catch(() => null))
        if (!organizer) {
          console.error(
            `Cannot get organizer ${data.createdBy} in event ${eventId}`
          )
          return { error: EVENT_ORGANIZER_NOT_FOUND_ERROR }
        }

        const event: CreatedEvent = {
          ...data,
          id: doc.id,
          participants,
          organizer,
        }
        return { event }
      }
    )

    if (error !== undefined) {
      throw new AppError(error)
    }

    return event
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new Error('Error getting event')
  }
}

export async function createEvent(event: CreateEventParams) {
  try {
    const doc = await eventCollection.add({
      ...event,
      participantIds: [],
      guests: [],
    })
    cache.del(EventsCacheKey.NewEvents)
    return doc.id
  } catch (error) {
    console.error('Error creating event:', error)
    throw new Error('Error creating event')
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await eventCollection.doc(eventId).delete()
    cache.del(EventsCacheKey.NewEvents)
    cache.del(EventsCacheKey.PastEvents)
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new AppError(UNKNOWN_ERROR)
  }
}
