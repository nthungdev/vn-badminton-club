import { CreatedEvent, HomeViewEvent, WriteEvent } from "@/firebase/definitions/event"

export const DEFAULT_EVENT_LEAVE_CUTOFF = 18 * 60 * 60 * 1000 // 18 hours
export const DEFAULT_EVENT_JOIN_CUTOFF = 30 * 60 * 1000 // 30 minutes

/**
 * Check whether the current time has passed specified timestamp (with cutoff)
 * @param timestamp
 * @param cutoff in milliseconds
 */
export function hasPassed(timestamp: Date, cutoff: number = 0) {
  return new Date(timestamp.getTime() - cutoff) < new Date()
}

export function isEventFull(event: CreatedEvent | WriteEvent | HomeViewEvent) {
  return event.participants.length >= event.slots
}