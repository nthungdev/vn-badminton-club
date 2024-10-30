import { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { verifySession } from '@/lib/session'
import { firestore } from '@/firebase/serverApp'
import { COLLECTION_EVENTS } from '@/firebase/firestore.constant'
import { eventReadConverter } from '@/firebase/utils'
import { FieldValue } from 'firebase-admin/firestore'
import { Role } from '@/firebase/definitions'
import { hasPassed } from '@/lib/utils/events'
import {
  EVENT_NOT_FOUND_ERROR,
  EVENT_STARTED_ERROR,
  MISSING_REQUIRED_FIELDS,
  UNAUTHORIZED_ERROR,
  USER_NOT_FOUND_ERROR,
} from '@/constants/errorMessages'

interface EventParticipantKickRequest {
  uid?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse(UNAUTHORIZED_ERROR, 401)
  }

  const { uid }: EventParticipantKickRequest = await request.json()
  const { id: eventId } = params

  if (uid === undefined) {
    return createErrorResponse(MISSING_REQUIRED_FIELDS, 400)
  }

  try {
    const eventRef = firestore
      .collection(COLLECTION_EVENTS)
      .withConverter(eventReadConverter)
      .doc(eventId)

    const { errorMessage, status } = await firestore.runTransaction(
      async (transaction) => {
        const doc = await transaction.get(eventRef)
        const event = doc.data()
        if (!doc.exists || event === undefined) {
          return { errorMessage: EVENT_NOT_FOUND_ERROR, status: 404 }
        }

        switch (decodedIdToken.role) {
          case Role.Mod:
            break
          case Role.Member:
            if (event.createdBy === decodedIdToken.uid) {
              const hasStarted = hasPassed(event.startTimestamp)
              if (hasStarted) {
                return {
                  errorMessage: EVENT_STARTED_ERROR,
                  status: 403,
                }
              }
              break
            }
          default:
            return { errorMessage: UNAUTHORIZED_ERROR, status: 403 }
        }

        const participant = event.participants.find((p) => p.uid === uid)
        if (!participant) {
          return { errorMessage: USER_NOT_FOUND_ERROR, status: 400 }
        }

        transaction.update(eventRef, {
          participants: FieldValue.arrayRemove(participant),
        })

        return {}
      }
    )

    if (errorMessage) {
      return createErrorResponse(errorMessage, status)
    }

    return createSuccessResponse()
  } catch (error) {
    console.error('Error kicking user from event:', error)
    return createErrorResponse(error, 500)
  }
}
