import { Timestamp } from 'firebase-admin/firestore'

export interface AppEvent {
  title: string
  startTimestamp: Date
  date: string
  startTime: string
  endTime: string
  slots: number
  // uid of the user who created the event
  createdBy: string
  byMod: boolean
}

export interface FirestoreEvent {
  title: string
  startTimestamp: Timestamp
  endTimestamp: Timestamp
  slots: number
  createdBy: string
  byMod: boolean
  participantIds: string[]
}

export interface CreateEvent {
  title: string
  startTimestamp: Date
  endTimestamp: Date
  slots: number
  // uid of the user who created the event
  createdBy: string
  byMod: boolean
}

export interface UpdateEvent {
  title: string
  startTimestamp: Date
  endTimestamp: Date
  slots: number
}

export type EventParticipant = {
  uid: string
  displayName: string
}

export type CreatedEvent = CreateEvent & {
  id: string
  organizer: EventParticipant
  participantIds: string[]
  participants: EventParticipant[]
}

export type HomeViewEvent = CreateEvent & {
  id: string
  participantIds: string[]
}