import {
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'

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
