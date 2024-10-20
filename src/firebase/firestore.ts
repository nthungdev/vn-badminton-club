'server-only'

import { FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import {
  CreatedEvent,
  CreateEvent,
  EventParticipant,
  FirestoreEvent,
  HomeViewEvent,
  UpdateEvent,
} from './definitions/event'
import { COLLECTION_EVENTS } from './firestore.constant'
import { firestore } from './serverApp'
import { getUserById } from '../lib/authUtils'
import { EventsCacheKey, getNodeCache } from '../lib/cache'
import AppError from '../lib/AppError'
import {
  EVENT_NOT_FOUND_ERROR,
  EVENT_ORGANIZER_NOT_FOUND_ERROR,
} from '@/constants/errorMessages'

const cache = getNodeCache('eventsCache')

const EVENT_CUTOFF = 8 * 60 * 60 * 1000 // 8 hours

function isEventFull(event: FirestoreEvent) {
  return event.participantIds.length + event.guests.length >= event.slots
}

const eventPublicConverter = {
  toFirestore: (data: HomeViewEvent) => {
    return { ...data }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreEvent>) => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      title: data.title,
      byMod: data.byMod,
      createdBy: data.createdBy,
      slots: data.slots,
      startTimestamp: data.startTimestamp.toDate(),
      endTimestamp: data.endTimestamp.toDate(),
      participantIds: data.participantIds || [],
      guests: data.guests || [],
    } as HomeViewEvent
  },
}

async function getEventParticipantFromUid(uid: string) {
  const user = await getUserById(uid)
  if (!user) {
    throw new Error('User not found')
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
    const snapshot = await firestore
      .collection(COLLECTION_EVENTS)
      .withConverter(eventPublicConverter)
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
    if (cache.has(EventsCacheKey.NewEvents)) {
      return cache.get(EventsCacheKey.NewEvents) as HomeViewEvent[]
    }

    const snapshot = await firestore
      .collection(COLLECTION_EVENTS)
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
    if (cache.has(EventsCacheKey.PastEvents)) {
      return cache.get(EventsCacheKey.PastEvents) as HomeViewEvent[]
    }

    const snapshot = await firestore
      .collection(COLLECTION_EVENTS)
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
  const eventsRef = firestore
    .collection(COLLECTION_EVENTS)
    .withConverter(eventPublicConverter)
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
              `Cannot get event participant ${uid} in event ${eventId}`
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
          participants,
          organizer,
        }
        return { event }
      }
    )

    if (error) {
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

export async function createEvent(event: CreateEvent) {
  try {
    const doc = await firestore
      .collection(COLLECTION_EVENTS)
      .add({ ...event, participantIds: [] })
    cache.del(EventsCacheKey.NewEvents)
    return doc.id
  } catch (error) {
    console.error('Error creating event:', error)
    throw new Error('Error creating event')
  }
}

export async function updateEvent(eventId: string, event: UpdateEvent) {
  try {
    await firestore
      .collection(COLLECTION_EVENTS)
      .doc(eventId)
      .update({ ...event })
    cache.del(EventsCacheKey.NewEvents)
  } catch (error) {
    console.error('Error updating event:', error)
    throw new Error('Error updating event')
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await firestore.collection(COLLECTION_EVENTS).doc(eventId).delete()
    cache.del(EventsCacheKey.NewEvents)
    cache.del(EventsCacheKey.PastEvents)
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new Error('Error deleting event')
  }
}

export async function joinEvent(uid: string, eventId: string) {
  const eventRef = firestore.collection(COLLECTION_EVENTS).doc(eventId)

  try {
    const error = await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef)
      if (!doc.exists) {
        return 'Event not found'
      }

      const data = doc.data() as FirestoreEvent
      if (data.participantIds.length >= data.slots) {
        return 'Event is full'
      }

      transaction.update(eventRef, {
        participantIds: FieldValue.arrayUnion(uid),
      })
    })

    if (error) {
      throw new Error(error)
    }

    console.info(`User ${uid} joined event ${eventId}`)
    cache.del(EventsCacheKey.NewEvents)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new Error('Error joining event')
  }
}

export async function leaveEvent(uid: string, eventId: string) {
  const eventRef = firestore.collection(COLLECTION_EVENTS).doc(eventId)

  try {
    const error = await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef)
      if (!doc.exists) {
        return 'Event not found'
      }

      const data = doc.data() as FirestoreEvent

      if (
        new Date(data.startTimestamp.seconds * 1000 - EVENT_CUTOFF) < new Date()
      ) {
        return 'Cannot leave event at this time'
      }

      transaction.update(eventRef, {
        participantIds: FieldValue.arrayRemove(uid),
      })
    })

    if (error) {
      throw new AppError(error)
    }

    cache.del(EventsCacheKey.NewEvents)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new Error('Error leaving event')
  }
}

export async function addGuest(uid: string, eventId: string) {
  const eventRef = firestore.collection(COLLECTION_EVENTS).doc(eventId)

  try {
    const error = await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef)
      if (!doc.exists) {
        return 'Event not found'
      }

      const data = doc.data() as FirestoreEvent
      if (data.participantIds.length >= data.slots) {
        return 'Event is full'
      }

      transaction.update(eventRef, {
        participantIds: FieldValue.arrayUnion(uid),
      })
    })

    if (error) {
      throw new Error(error)
    }

    console.info(`User ${uid} joined event ${eventId}`)
    cache.del(EventsCacheKey.NewEvents)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new Error('Error joining event')
  }
}
