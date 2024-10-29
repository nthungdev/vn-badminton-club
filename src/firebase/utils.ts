'server-only'

import { auth } from './serverApp'
import { createAuthError } from './error'
import { Role } from './definitions'
import {
  CreatedEvent,
  FirestoreEvent,
  HomeViewEvent,
  WriteEvent,
} from './definitions/event'
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export async function setUserRole(uid: string, role: string) {
  if (!(Object.values(Role) as string[]).includes(role)) {
    throw createAuthError('ROLE_INVALID')
  }

  try {
    const user = await auth.getUser(uid)
    const newClaims = {
      ...user.customClaims,
      role,
    }
    await auth.setCustomUserClaims(uid, newClaims)
  } catch (error) {
    console.log('Error setting role:', error)
    throw createAuthError('ROLE_SET_ERROR', error)
  }
}

export function isEventFull(event: CreatedEvent | WriteEvent | HomeViewEvent) {
  return event.participants.length >= event.slots
}

export const eventReadConverter = {
  toFirestore: (data: CreatedEvent) => {
    return data
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreEvent>) => {
    const data = snapshot.data()
    const event: HomeViewEvent = {
      ...data,
      id: snapshot.id,
      startTimestamp: data.startTimestamp.toDate(),
      endTimestamp: data.endTimestamp.toDate(),
      participants: data.participants || [],
    }
    return event
  },
}

export const eventWriteConverter = {
  toFirestore: (data: WriteEvent) => {
    return { ...data }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirestoreEvent>) => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      title: data.title,
      byMod: data.byMod,
      createdBy: data.createdBy,
      slots: data.slots,
      startTimestamp: data.startTimestamp.toDate(),
      endTimestamp: data.endTimestamp.toDate(),
      participants: data.participants || [],
    }
  },
}
