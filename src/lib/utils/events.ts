import {
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'

export const DEFAULT_EVENT_CUTOFF = 18 * 60 * 60 * 1000 // 8 hours

export function isEventParticipant(
  participant: EventParticipant | FirestoreEventGuest
): participant is EventParticipant {
  return (participant as EventParticipant).uid !== undefined
}

export function isFirestoreEventGuest(
  participant: EventParticipant | FirestoreEventGuest
): participant is FirestoreEventGuest {
  return (participant as FirestoreEventGuest).guestId !== undefined
}

/**
 * @param startTimestamp
 * @param cutoff in milliseconds
 */
export function isPast(startTimestamp: Date, cutoff: number = 0) {
  return new Date(startTimestamp.getTime() - cutoff) < new Date()
}
