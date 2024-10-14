import { eventTime, nowToTimestamp } from '@/lib/format'
import Link from 'next/link'
import EventCardModBadge from './EventCardModBadge'

interface EventCardProps {
  id: string
  title: string
  byMod: boolean
  startTimestamp: Date
  endTimestamp: Date
}

export default function EventCard(props: EventCardProps) {
  return (
    <div
      key={props.id}
      className="flex flex-col bg-white border shadow-sm rounded-xl"
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
        <Link
          href={`/event?e=${props.id}`}
          className="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-secondary decoration-2 hover:text-primary hover:underline focus:underline focus:outline-none focus:text-primary disabled:opacity-50 disabled:pointer-events-none"
        >
          View
        </Link>
      </div>
    </div>
  )
}
