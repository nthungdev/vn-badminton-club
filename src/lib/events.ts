'server-only'

import {
  EVENT_NOT_FOUND_ERROR,
  EVENT_STARTED_ERROR,
  UNAUTHORIZED_ERROR,
  UNKNOWN_ERROR,
} from '@/constants/errorMessages'
import { Role } from '@/firebase/definitions'
import { UpdateEvent } from '@/firebase/definitions/event'
import { COLLECTION_EVENTS } from '@/firebase/firestore.constant'
import { firestore } from '@/firebase/serverApp'
import { eventReadConverter } from '@/firebase/utils'
import { isPast } from './utils/events'
import AppError from './AppError'

const eventCollection = firestore.collection(COLLECTION_EVENTS)

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
  update: UpdateEvent,
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
          title: update.title,
          startTimestamp: new Date(update.startTimestamp),
          endTimestamp: new Date(update.endTimestamp),
          slots: update.slots,
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
