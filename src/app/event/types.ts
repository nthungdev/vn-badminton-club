import {
  EventParticipantUser,
  FirestoreEventParticipantGuest,
} from '@/firebase/definitions/event'

export interface GroupedParticipants {
  users: EventParticipantUser[]
  userGuests: Record<
    string,
    {
      displayName: string
      guests: FirestoreEventParticipantGuest[]
    }
  >
}
