// Netlify cannot ignore deploying upon new posts to support incremental static regeneration

import { getEventById } from '@/actions/events'
import { redirect } from 'next/navigation'

import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

export default async function Page({
  params: { id },
}: {
  params: { id: string }
}) {
  const event = await getEventById(id)
  if (!event) {
    redirect('/404')
  }

  const formatEventTime = (start: Date, end: Date) => {
    console.log({ start, end })

    const startTime = dayjs(start)
    const endTime = dayjs(end)

    if (startTime.format('YYYYMMDD') === endTime.format('YYYYMMDD')) {
      return `${startTime.format('dddd, MMMM d')} ⋅ ${startTime.format(
        'h:mm A'
      )} - ${endTime.format('h:mm A')}`
    } else {
      return `${startTime.format('dddd, MMMM d, h:mm A')} - ${endTime.format(
        'dddd, MMMM d, h:mm A'
      )}`
    }
  }

  const formattedTime = formatEventTime(
    event.startTimestamp,
    event.endTimestamp
  )

  console.log({ event })

  // TODO remove this when we have real data
  event.participants = [
    {
      uid: '1',
      displayName: 'John Doe',
    },
    {
      uid: '2',
      displayName: 'John Doe',
    },
    {
      uid: '3',
      displayName: 'John Doe',
    },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4 flex-1 overflow-hidden">
        <div className="max-w-md mx-auto">
          <div>
            <div className="text-gray-600 text-center text-sm">Event</div>
            <h1 className="text-xl font-bold text-center text-primary">
              {event.title}
            </h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-semibold">Organizer</span>
              <div className="p-4 bg-white border shadow-sm rounded-xl">
                <div className="text-center">{event.organizer.displayName}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold">Time</span>
              <div className="p-4 bg-white border shadow-sm rounded-xl">
                <div className="text-center">{formattedTime}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold">Participants</span>
              <div className="p-4 bg-white border shadow-sm rounded-xl space-y-1">
                <div className="text-right w-full font-semibold text-primary">
                  {event.participants.length} / {event.slots}
                </div>
                <ul className="space-y-1">
                  {event.participants.map((participant) => (
                    <li key={participant.uid} className="text-center">
                      {participant.displayName}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 shadow-inner">
        <button
          type="button"
          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-700 focus:outline-none focus:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
          disabled
        >
          Join Event
        </button>
      </div>
    </div>
  )
}
