// Netlify cannot ignore deploying upon new posts to support incremental static regeneration

import { getEventById } from '@/actions/events'
import { redirect } from 'next/navigation'
import dayjs from 'dayjs'
import RenderedEventPage from './RenderedEventPage'
import { Role } from '@/firebase/definitions'
import { getAuthUser } from '@/lib/authUtils'

export default async function EventPage({
  searchParams: { e },
}: {
  searchParams: { e?: string }
}) {
  const eventId = e
  if (!eventId) {
    throw new Error('Invalid event ID')
  }

  const event = await getEventById(eventId)
  if (!event) {
    redirect('/404')
  }

  const me = await getAuthUser()
  if (!me) {
    console.error('Error getting user')
    throw new Error('User information not found')
  }

  const isPastEvent = dayjs().isAfter(dayjs(event.startTimestamp))
  const isMeOrganizer = me.uid === event.organizer.uid
  const isMeMod = me?.role === Role.Mod

  return (
    <RenderedEventPage
      event={event}
      showJoinButton={!isPastEvent}
      showCancelButton={(isMeOrganizer || isMeMod) && !isPastEvent}
      showUpdateButton={(isMeOrganizer || isMeMod) && !isPastEvent}
    />
  )
}
