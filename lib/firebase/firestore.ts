'server-only'

import { FieldValue } from 'firebase-admin/firestore'
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
import { getUserById } from '../authUtils'
import { EventsCacheKey, getNodeCache } from '../cache'
import AppError from '../AppError'

const cache = getNodeCache('eventsCache')

const EVENT_CUTOFF = 8 * 60 * 60 * 1000 // 8 hours

function snapshotToEvents(
  snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  return snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreEvent
    const event: HomeViewEvent = {
      ...data,
      id: doc.id,
      startTimestamp: data.startTimestamp.toDate(),
      endTimestamp: data.endTimestamp.toDate(),
    }
    return event
  })
}

export async function getJoinedEvents(
  uid: string,
  { limit }: { limit: number }
) {
  try {
    const snapshot = await firestore
      .collection(COLLECTION_EVENTS)
      .where('participantIds', 'array-contains', uid)
      .orderBy('startTimestamp')
      .limit(limit)
      .get()

    const events = snapshotToEvents(snapshot)
    return events
  } catch (error) {
    console.error('Error getting joined events:', error)
    throw new Error('Error getting joined events')
  }
}

async function getNewEvents({ limit }: { limit: number }) {
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

    const events = snapshotToEvents(snapshot)
    cache.set(EventsCacheKey.NewEvents, events)
    return events
  } catch (error) {
    console.error('Error getting events:', error)
    throw new Error('Error getting events')
  }
}

async function getPastEvents({ limit }: { limit: number }) {
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

    const events = snapshotToEvents(snapshot)
    cache.set(EventsCacheKey.PastEvents, events)
    return events
  } catch (error) {
    console.error('Error getting events:', error)
    throw new Error('Error getting events')
  }
}

async function getEventById(eventId: string) {
  try {
    const doc = await firestore.collection(COLLECTION_EVENTS).doc(eventId).get()
    if (!doc.exists) {
      return null
    }
    const data = doc.data() as FirestoreEvent

    const participants: EventParticipant[] = []
    for (const uid of data.participantIds) {
      const participant = await getUserById(uid)
      if (participant) {
        participants.push(participant as EventParticipant)
      }
    }

    const organizer = (await getUserById(
      data.createdBy
    )) as EventParticipant | null
    if (!organizer) {
      throw new Error('Organizer not found')
    }

    const event: CreatedEvent = {
      ...data,
      id: doc.id,
      participants,
      organizer,
      startTimestamp: data.startTimestamp.toDate(),
      endTimestamp: data.endTimestamp.toDate(),
    }

    return event
  } catch (error) {
    console.error('Error getting event:', error)
    throw new Error('Error getting event')
  }
}

async function createEvent(event: CreateEvent) {
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

async function updateEvent(eventId: string, event: UpdateEvent) {
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

async function deleteEvent(eventId: string) {
  try {
    await firestore.collection(COLLECTION_EVENTS).doc(eventId).delete()
    cache.del(EventsCacheKey.NewEvents)
    cache.del(EventsCacheKey.PastEvents)
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new Error('Error deleting event')
  }
}

async function joinEvent(uid: string, eventId: string) {
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
    console.error('Error joining event:', error)
    throw new Error('Error joining event')
  }
}

async function leaveEvent(uid: string, eventId: string) {
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
    console.error('Error leaving event:', error)
    throw new Error('Error leaving event')
  }
}

export {
  getNewEvents,
  getPastEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
}
