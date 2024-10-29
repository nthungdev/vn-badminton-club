import { Timestamp } from 'firebase-admin/firestore'

export interface FirestoreEvent {
  title: string
  startTimestamp: Timestamp
  endTimestamp: Timestamp
  slots: number
  createdBy: string
  byMod: boolean
  participants: FirestoreEventParticipant[]
}

export interface FirestoreEventParticipantGuest {
  type: 'guest'
  uid?: string
  guestId: string
  displayName: string
  addedByUid: string
  addedByDisplayName: string
}

export interface FirestoreEventParticipantUser {
  type: 'user'
  uid: string
  guestId?: string
  displayName?: string
  addedByUid?: string
  addedByDisplayName?: string
}

export interface EventParticipantUser {
  type: 'user'
  uid: string
  guestId?: string
  displayName: string
  addedByUid?: string
  addedByDisplayName?: string
}

export type FirestoreEventParticipant =
  | FirestoreEventParticipantGuest
  | FirestoreEventParticipantUser

export type EventParticipant =
  | EventParticipantUser
  | FirestoreEventParticipantGuest

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

export type CreatedEvent = HomeViewEvent & {
  organizer: EventParticipantUser
  participants: EventParticipant[]
}

export type WriteEvent = CreateEventParams & {
  participants: FirestoreEventParticipant[]
}

export type HomeViewEvent = CreateEventParams & {
  id: string
  participants: FirestoreEventParticipant[]
}
