import { EventParticipant, FirestoreEventGuest } from "@/firebase/definitions/event"

export interface GroupedParticipants {
  users: EventParticipant[]
  userGuests: Record<
    string,
    {
      userDisplayName: string
      guests: FirestoreEventGuest[]
    }
  >
}