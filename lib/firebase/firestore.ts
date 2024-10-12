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

const cache = getNodeCache('eventsCache')

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

    const events = snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreEvent

      const event: HomeViewEvent = {
        ...data,
        id: doc.id,
        startTimestamp: data.startTimestamp.toDate(),
        endTimestamp: data.endTimestamp.toDate(),
      }

      return event
    })
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
      .orderBy('startTimestamp')
      .limit(limit)
      .get()

    const events = snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreEvent

      const event: HomeViewEvent = {
        ...data,
        id: doc.id,
        startTimestamp: data.startTimestamp.toDate(),
        endTimestamp: data.endTimestamp.toDate(),
      }

      return event
    })
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
  try {
    await firestore
      .collection(COLLECTION_EVENTS)
      .doc(eventId)
      .update({
        participantIds: FieldValue.arrayUnion(uid),
      })
    cache.del(EventsCacheKey.NewEvents)
  } catch (error) {
    console.error('Error joining event:', error)
    throw new Error('Error joining event')
  }
}

async function leaveEvent(uid: string, eventId: string) {
  try {
    const result = await firestore
      .collection(COLLECTION_EVENTS)
      .doc(eventId)
      .update({
        participantIds: FieldValue.arrayRemove(uid),
      })
    cache.del(EventsCacheKey.NewEvents)
    return result.isEqual
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
