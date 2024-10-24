import { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { verifySession } from '@/lib/session'
import { firestore } from '@/firebase/serverApp'
import { COLLECTION_EVENTS } from '@/firebase/firestore.constant'
import { eventReadConverter } from '@/firebase/utils'
import { FieldValue } from 'firebase-admin/firestore'
import { Role } from '@/firebase/definitions'
import { isPast } from '@/lib/utils/events'

interface EventParticipantKickRequest {
  uid?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken) {
    return createErrorResponse('Unauthorized', 401)
  }

  const { uid }: EventParticipantKickRequest = await request.json()
  const { id: eventId } = params

  if (uid === undefined) {
    return createErrorResponse('Missing user uid', 400)
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
          return { errorMessage: 'Event not found.', status: 404 }
        }

        switch (decodedIdToken.role) {
          case Role.Mod:
            break
          case Role.Member:
            if (event.createdBy === decodedIdToken.uid) {
              const hasStarted = isPast(event.startTimestamp)
              if (hasStarted) {
                return {
                  errorMessage:
                    'Kicking is not allowed once the event has started.',
                  status: 403,
                }
              }
              break
            }
          default:
            return { errorMessage: 'Unauthorized.', status: 403 }
        }

        if (!event.participantIds.includes(uid)) {
          return { errorMessage: 'Invalid uid.', status: 400 }
        }

        transaction.update(eventRef, {
          participantIds: FieldValue.arrayRemove(uid),
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
