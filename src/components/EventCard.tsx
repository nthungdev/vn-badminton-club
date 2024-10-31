import Link from 'next/link'
import { eventTime, nowToTimestamp } from '@/lib/format'
import EventCardModBadge from './EventCardModBadge'
import { FirestoreEventParticipant } from '@/firebase/definitions/event'

interface EventCardProps {
  id: string
  title: string
  byMod: boolean
  startTimestamp: Date
  endTimestamp: Date
  slots: number
  participants: FirestoreEventParticipant[]
}

export default function EventCard(props: EventCardProps) {
  const participantCount = props.participants.length

  return (
    <Link
      key={props.id}
      href={`/event?e=${props.id}`}
      className="flex flex-col bg-white border shadow-sm rounded-xl hover:bg-secondary-50 hover:ring hover:cursor-pointer"
    >
      <div className="flex flex-row justify-between items-center border-b rounded-t-xl">
        <span className="py-3 px-4 md:px-5 text-lg font-bold text-gray-800">
          {props.title}
        </span>
        {props.byMod && <EventCardModBadge />}
      </div>
      <div className="p-4 md:p-5">
        <div className="text-gray-700">
          {eventTime(props.startTimestamp, props.endTimestamp)}
        </div>
        <div className="text-gray-500">
          {nowToTimestamp(props.startTimestamp)}
        </div>
        <div className="mt-2 w-full flex flex-row justify-between items-center">
          <span className="bg-secondary-100 rounded-full py-1 px-3">
            <span className="font-semibold text-secondary">
              {participantCount} / {props.slots}
            </span>
            <span> </span>
            <span className="text-secondary">Participants</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
