// Netlify cannot ignore deploying upon new posts to support incremental static regeneration

import { getEventById } from '@/actions/events'
import { redirect } from 'next/navigation'
import dayjs from 'dayjs'
import { EventParticipant } from '@/firebase/definitions/event'
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

  const selfParticipant = {
    uid: me.uid,
    displayName: me.displayName,
  } as EventParticipant

  return (
    <RenderedEventPage
      byMod={event.byMod}
      eventId={event.id}
      selfParticipant={selfParticipant}
      participants={event.participants}
      organizerDisplayName={event.organizer.displayName}
      slots={event.slots}
      startTimestamp={event.startTimestamp}
      endTimestamp={event.endTimestamp}
      title={event.title}
      showJoinButton={!isPastEvent}
      showCancelButton={(isMeOrganizer || isMeMod) && !isPastEvent}
      showUpdateButton={(isMeOrganizer || isMeMod) && !isPastEvent}
    />
  )
}
