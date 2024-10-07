import { COLLECTION_EVENTS } from './firestore.constant'
import { firestore } from './serverApp'

interface AppEvent {
  title: string
  date: string
  startTime: string
  endTime: string
  slots: number
  // uid of the user who created the event
  createdBy: string
}

type CreateEvent = Omit<AppEvent, 'createdBy'>

async function getEvent(eventId: string) {
  try {
    const doc = await firestore.collection(COLLECTION_EVENTS).doc(eventId).get()
    if (!doc.exists) {
      return null
    }
    return { id: doc.id, ...doc.data() }
  } catch (error) {
    console.error('Error getting event:', error)
    throw new Error('Error getting event')
  }
}

async function createEvent(event: AppEvent) {
  try {
    const doc = await firestore.collection(COLLECTION_EVENTS).add(event)
    return doc.id
  } catch (error) {
    console.error('Error creating event:', error)
    throw new Error('Error creating event')
  }
}

async function updateEvent(eventId: string, event: AppEvent) {
  try {
    await firestore
      .collection(COLLECTION_EVENTS)
      .doc(eventId)
      .update({ ...event })
  } catch (error) {
    console.error('Error updating event:', error)
    throw new Error('Error updating event')
  }
}

async function deleteEvent(eventId: string) {
  try {
    await firestore.collection(COLLECTION_EVENTS).doc(eventId).delete()
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new Error('Error deleting event')
  }
}

export { getEvent, createEvent, updateEvent, deleteEvent }
export type { AppEvent, CreateEvent }
