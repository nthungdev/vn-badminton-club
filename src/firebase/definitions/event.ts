import { Timestamp } from 'firebase-admin/firestore'

export interface FirestoreEventGuest {
  displayName: string
  addedBy: string
  userDisplayName: string
  guestId: string
}

export interface FirestoreEvent {
  title: string
  startTimestamp: Timestamp
  endTimestamp: Timestamp
  slots: number
  createdBy: string
  byMod: boolean
  participantIds: string[]
  guests: FirestoreEventGuest[]
}

export interface CreateEventParams {
  title: string
  startTimestamp: Date
  endTimestamp: Date
  slots: number
  // uid of the user who created the event
  createdBy: string
  byMod: boolean
}

export interface EditEventParams {
  title: string
  startTimestamp: Date
  endTimestamp: Date
  slots: number
}

export type EventParticipant = {
  uid: string
  displayName: string
}

export type CreatedEvent = HomeViewEvent & {
  organizer: EventParticipant
  participants: EventParticipant[]
}

export type WriteEvent = CreateEventParams & {
  participantIds: string[]
  guests: FirestoreEventGuest[]
}

export type HomeViewEvent = CreateEventParams & {
  id: string
  participantIds: string[]
  guests: FirestoreEventGuest[]
}

