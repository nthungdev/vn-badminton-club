import { FirestoreEventGuest } from '@/firebase/definitions/event'
import { ApiResponse } from '@/lib/apiResponse'

export type EventsAddGuestResponse = ApiResponse<{
  guest: FirestoreEventGuest
}>
