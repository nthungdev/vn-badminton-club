'server-only'

import { FieldValue } from 'firebase-admin/firestore'
import {
  CreatedEvent,
  CreateEvent,
  EventParticipant,
  FirestoreEvent,
  FirestoreEventGuest,
  UpdateEvent,
} from './definitions/event'
import { COLLECTION_EVENTS } from './firestore.constant'
import { firestore } from './serverApp'
import AppError from '../lib/AppError'
import {
  EVENT_FULL_ERROR,
  EVENT_NOT_FOUND_ERROR,
  EVENT_ORGANIZER_NOT_FOUND_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { EventsCacheKey, getNodeCache } from '@/lib/cache'
import { getUserById } from '@/lib/authUtils'
import { DEFAULT_EVENT_CUTOFF } from '@/lib/utils/events'
import { eventReadConverter, eventWriteConverter, isEventFull } from './utils'

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

export async function createEvent(event: CreateEvent) {
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

export async function updateEvent(eventId: string, event: UpdateEvent) {
  try {
    await eventCollection.doc(eventId).update({ ...event })
    cache.del(EventsCacheKey.NewEvents)
  } catch (error) {
    console.error('Error updating event:', error)
    throw new Error('Error updating event')
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

export async function joinEvent(uid: string, eventId: string) {
  const eventReadRef = eventCollection
    .withConverter(eventReadConverter)
    .doc(eventId)
  const eventWriteRef = eventCollection
    .withConverter(eventWriteConverter)
    .doc(eventId)

  try {
    const error = await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(eventReadRef)
      if (!doc.exists) {
        return 'Event not found'
      }
      const data = doc.data()
      if (!doc.exists || !data) {
        return EVENT_NOT_FOUND_ERROR
      }

      if (isEventFull(data)) {
        return EVENT_FULL_ERROR
      }

      transaction.update(eventWriteRef, {
        participantIds: FieldValue.arrayUnion(uid),
      })
    })

    if (error !== undefined) {
      throw new AppError(error)
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
        new Date(data.startTimestamp.seconds * 1000 - DEFAULT_EVENT_CUTOFF) <
        new Date()
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

export async function addGuest(
  eventId: string,
  uid: string,
  userDisplayName: string,
  displayName: string
) {
  const eventRef = eventCollection
    .withConverter(eventWriteConverter)
    .doc(eventId)

  try {
    const { error, guest } = await firestore.runTransaction(
      async (transaction) => {
        const doc = await transaction.get(eventRef)
        const data = doc.data()
        if (!doc.exists || !data) {
          return { error: EVENT_NOT_FOUND_ERROR }
        }

        if (isEventFull(data)) {
          return { error: EVENT_FULL_ERROR }
        }

        const guest: FirestoreEventGuest = {
          addedBy: uid,
          userDisplayName,
          guestId: new Date().getTime().toString(),
          displayName,
        }

        transaction.update(eventRef, {
          guests: FieldValue.arrayUnion(guest),
        })

        return { guest }
      }
    )

    if (error !== undefined) {
      throw new AppError(error)
    }

    console.info(`User ${uid} added guest ${displayName} to event ${eventId}`)
    cache.del(EventsCacheKey.NewEvents)
    return guest
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.log('Error adding guest to event:', { error })
    throw new Error('Error adding guest to event')
  }
}

export async function kickGuest(
  eventId: string,
  guestId: string,
  meUid: string,
  { checkPermission = true }: { checkPermission: boolean }
) {
  const eventRef = eventCollection
    .withConverter(eventWriteConverter)
    .doc(eventId)

  try {
    const errorMessage = await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef)
      const data = doc.data()
      if (!doc.exists || !data) {
        return EVENT_NOT_FOUND_ERROR
      }

      if (checkPermission) {
        const guest = data.guests.find((guest) => guest.guestId === guestId)
        if (guest) {
          if (guest.addedBy !== meUid && data.createdBy !== meUid) {
            return 'Unauthorized. You are not allowed to kick this guest.'
          }
        } else {
          // Might happen when race condition: the guest was already kicked by someone else
          return 'Guest not found.'
        }
      }

      transaction.update(eventRef, {
        guests: data.guests.filter((guest) => guest.guestId !== guestId),
      })
    })

    if (errorMessage !== undefined) {
      throw new AppError(errorMessage)
    }

    console.info(`Guest ${guestId} was kicked from event ${eventId}`)
    cache.del(EventsCacheKey.NewEvents)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    console.log('Error kicking guest from event:', { error })
    throw new Error('Error kicking guest from event')
  }
}
