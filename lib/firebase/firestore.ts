'server-only'

import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import {
  AppEvent,
  CreatedEvent,
  CreateEvent,
  EventParticipant,
  FirestoreEvent,
} from './definitions/event'
import { COLLECTION_EVENTS } from './firestore.constant'
import { firestore } from './serverApp'
import { getUserById } from '../authUtils'

async function getNewEvents() {
  try {
    const snapshot = await firestore
      .collection(COLLECTION_EVENTS)
      .where('startTimestamp', '>=', new Date())
      .orderBy('startTimestamp')
      .limit(10)
      .get()

    const events = snapshot.docs.map((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
        startTimestamp: (doc.data()?.startTimestamp as Timestamp).toDate(),
        endTimestamp: (doc.data()?.endTimestamp as Timestamp).toDate(),
      } as CreatedEvent
      return data
    })
    return events
  } catch (error) {
    console.error('Error getting events:', error)
    throw new Error('Error getting events')
  }
}

async function getPastEvents() {
  try {
    const snapshot = await firestore
      .collection(COLLECTION_EVENTS)
      .where('startTimestamp', '<', new Date())
      .orderBy('startTimestamp')
      .limit(10)
      .get()

    const events = snapshot.docs.map((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
        startTimestamp: (doc.data()?.startTimestamp as Timestamp).toDate(),
        endTimestamp: (doc.data()?.endTimestamp as Timestamp).toDate(),
      } as CreatedEvent
      return data
    })
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

    // const participantsIds = data.participants as string[]
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
    return doc.id
  } catch (error) {
    console.error('Error creating event:', error)
    throw new Error('Error creating event')
  }
}

async function updateEvent(eventId: string, event: AppEvent) {
  try {
    await firestore
      .collection(COLLECTION_EVENTS)
      .doc(eventId)
      .update({ ...event })
  } catch (error) {
    console.error('Error updating event:', error)
    throw new Error('Error updating event')
  }
}

async function deleteEvent(eventId: string) {
  try {
    await firestore.collection(COLLECTION_EVENTS).doc(eventId).delete()
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new Error('Error deleting event')
  }
}

async function joinEvent(uid: string, eventId: string) {
  try {
    await firestore.collection(COLLECTION_EVENTS).doc(eventId).update({
      participantIds: FieldValue.arrayUnion(uid),
    })
  } catch (error) {
    console.error('Error joining event:', error)
    throw new Error('Error joining event')
  }
}

async function leaveEvent(uid: string, eventId: string) {
  try {
    const result = await firestore.collection(COLLECTION_EVENTS).doc(eventId).update({
      participantIds: FieldValue.arrayRemove(uid),
    })
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
  leaveEvent
}
