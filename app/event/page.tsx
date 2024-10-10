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
import { eventTime } from '@/lib/format'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

export default async function Page({
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
    return
  }

  const formattedTime = eventTime(event.startTimestamp, event.endTimestamp)

  const me = await getMe()
  if (!me) {
    console.error('Error getting user')
    throw new Error('Error getting user')
  }

  const isPastEvent = dayjs().isAfter(dayjs(event.startTimestamp))

  const selfParticipant = {
    uid: me.uid,
    displayName: me.displayName,
  } as EventParticipant

  return (
    <RenderedEventPage
      eventId={event.id}
      selfParticipant={selfParticipant}
      participants={event.participants}
      organizerDisplayName={event.organizer.displayName}
      showJoinButton={!isPastEvent}
      slots={event.slots}
      time={formattedTime}
      title={event.title}
    />
  )
}
