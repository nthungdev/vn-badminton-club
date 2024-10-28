'server-only'

import {
  EVENT_FULL_ERROR,
  EVENT_GUEST_NOT_FOUND_ERROR,
  EVENT_LATE_JOIN_ERROR,
  EVENT_NOT_FOUND_ERROR,
  EVENT_STARTED_ERROR,
  UNAUTHORIZED_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { Role } from '@/firebase/definitions'
import { EditEventParams } from '@/firebase/definitions/event'
import { COLLECTION_EVENTS } from '@/firebase/firestore.constant'
import { firestore } from '@/firebase/serverApp'
import {
  eventReadConverter,
  eventWriteConverter,
  isEventFull,
} from '@/firebase/utils'
import { DEFAULT_EVENT_JOIN_CUTOFF, isPast } from '../utils/events'
import AppError from '../AppError'
import { FieldValue } from 'firebase-admin/firestore'

const eventCollection = firestore.collection(COLLECTION_EVENTS)

export async function joinEvent(uid: string, eventId: string) {
  const eventReadRef = eventCollection
    .withConverter(eventReadConverter)
    .doc(eventId)
  const eventWriteRef = eventCollection
    .withConverter(eventWriteConverter)
    .doc(eventId)

  try {
    const { errorMessage } = await firestore.runTransaction(
      async (transaction) => {
        const doc = await transaction.get(eventReadRef)
        const event = doc.data()
        if (!doc.exists || event === undefined) {
          return { errorMessage: EVENT_NOT_FOUND_ERROR }
        }

        if (isEventFull(event)) {
          return { errorMessage: EVENT_FULL_ERROR }
        }

        const afterJoinCutoff = isPast(event.startTimestamp, DEFAULT_EVENT_JOIN_CUTOFF)
        if (afterJoinCutoff) {
          return { errorMessage: EVENT_LATE_JOIN_ERROR }
        }

        transaction.update(eventWriteRef, {
          participantIds: FieldValue.arrayUnion(uid),
        })
        return {}
      }
    )

    if (errorMessage !== undefined) {
      throw new AppError(errorMessage)
    }

    console.info(`User ${uid} joined event ${eventId}`)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new Error('Error joining event')
  }
}

/**
 * @throws {AppError} with message either
 * - UNAUTHORIZED_ERROR
 * - EVENT_NOT_FOUND_ERROR,
 * - EVENT_STARTED_ERROR
 * - UNKNOWN_ERROR
 * @returns
 */
export async function editEvent(
  eventId: string,
  params: EditEventParams,
  uid: string,
  role: Role
) {
  try {
    const { errorMessage } = await firestore.runTransaction(
      async (transaction) => {
        const doc = await transaction.get(
          eventCollection.withConverter(eventReadConverter).doc(eventId)
        )
        const event = doc.data()
        if (!doc.exists || event === undefined) {
          return { errorMessage: EVENT_NOT_FOUND_ERROR }
        }

        switch (role) {
          case Role.Mod:
            break
          case Role.Member:
            if (event.createdBy === uid) {
              const hasStarted = isPast(event.startTimestamp)
              if (hasStarted) {
                return {
                  errorMessage: EVENT_STARTED_ERROR,
                }
              }
              break
            }
          default:
            return { errorMessage: UNAUTHORIZED_ERROR }
        }

        const updatedEvent = {
          title: params.title,
          startTimestamp: new Date(params.startTimestamp),
          endTimestamp: new Date(params.endTimestamp),
          slots: params.slots,
        }

        transaction.update(eventCollection.doc(eventId), updatedEvent)

        return {}
      }
    )

    if (errorMessage) {
      return new AppError(errorMessage)
    }
  } catch (error) {
    return new AppError(UNKNOWN_ERROR, error)
  }
}

/**
 * @throws {AppError} with message either
 * - UNAUTHORIZED_ERROR
 * - EVENT_NOT_FOUND_ERROR
 * - EVENT_GUEST_NOT_FOUND_ERROR
 * - EVENT_STARTED_ERROR
 * - UNKNOWN_ERROR
 */
export async function kickGuest(
  eventId: string,
  guestId: string,
  uid: string,
  role: Role
) {
  const eventRef = eventCollection
    .withConverter(eventWriteConverter)
    .doc(eventId)

  try {
    const errorMessage = await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef)
      const event = doc.data()
      if (!doc.exists || !event) {
        return EVENT_NOT_FOUND_ERROR
      }

      const guest = event.guests.find((guest) => guest.guestId === guestId)
      if (!guest) {
        // Might happen when rare race condition: the guest was already kicked by someone else
        return EVENT_GUEST_NOT_FOUND_ERROR
      }

      switch (role) {
        case Role.Mod:
          break
        case Role.Member:
          const hasStarted = isPast(event.startTimestamp)
          if (hasStarted) {
            return EVENT_STARTED_ERROR
          }

          if (event.createdBy === uid) {
            break
          } else {
            // make sure the guest is added by the user
            if (guest.addedBy === uid) {
              break
            }
          }
        default:
          return UNAUTHORIZED_ERROR
      }

      transaction.update(eventRef, {
        guests: event.guests.filter((guest) => guest.guestId !== guestId),
      })
    })

    if (errorMessage !== undefined) {
      throw new AppError(errorMessage)
    }

    console.info(`Guest ${guestId} was kicked from event ${eventId}`)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    return new AppError(UNKNOWN_ERROR, error)
  }
}
