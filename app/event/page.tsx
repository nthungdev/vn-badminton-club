// Netlify cannot ignore deploying upon new posts to support incremental static regeneration

import { getEventById } from '@/actions/events'
import { redirect } from 'next/navigation'

import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'
import { getMe } from '@/actions/auth'
import { EventParticipant } from '@/lib/firebase/definitions/event'
import RenderedEventPage from './RenderedEventPage'
import { Role } from '@/lib/firebase/definitions'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

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

  const me = await getMe()
  if (!me) {
    console.error('Error getting user')
    throw new Error('Error getting user')
  }

  const isPastEvent = dayjs().isAfter(dayjs(event.startTimestamp))
  const isMeOrganizer = me.uid === event.organizer.uid
  const isMeMod = me.customClaims?.role === Role.Mod

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
