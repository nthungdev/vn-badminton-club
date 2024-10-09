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

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

const formatEventTime = (startDate: Date, endDate: Date) => {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const startEndSameDay = start.format('YYYYMMDD') === end.format('YYYYMMDD')

  if (startEndSameDay) {
    const startDay = start.format('dddd, MMMM D')
    const startTime = start.format('h:mm A')
    const endTime = end.format('h:mm A')
    return `${startDay} ⋅ ${startTime} - ${endTime}`
  } else {
    const startFull = start.format('dddd, MMMM D, h:mm A')
    const endFull = end.format('dddd, MMMM D, h:mm A')
    return `${startFull} - ${endFull}`
  }
}

export default async function Page({
  searchParams: { e },
}: {
  searchParams: {e?: string}
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

  const formattedTime = formatEventTime(
    event.startTimestamp,
    event.endTimestamp
  )

  const me = await getMe()
  if (!me) {
    console.error('Error getting user')
    throw new Error('Error getting user')
  }

  const isEventJoined = !!event.participants.find(
    (p) => p.uid === me.uid
  )
  const isMyEvent = event.organizer.uid === me.uid
  const isPastEvent = dayjs().isAfter(dayjs(event.startTimestamp))
  const isAllowedToJoin = !isMyEvent && !isPastEvent

  const selfParticipant = {
    uid: me.uid,
    displayName: me.displayName,
  } as EventParticipant

  return (
    <RenderedEventPage
      eventId={event.id}
      eventJoined={isEventJoined}
      selfParticipant={selfParticipant}
      participants={event.participants}
      organizerDisplayName={event.organizer.displayName}
      showJoinButton={isAllowedToJoin}
      slots={event.slots}
      time={formattedTime}
      title={event.title}
    />
  )
}
