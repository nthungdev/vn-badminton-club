'use client'

import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { HomeViewEvent } from '@/lib/firebase/definitions/event'
import LoadingSpinner from '@/components/LoadingSpinner'
import { eventTime, nowToTimestamp } from '@/lib/format'
import AppError from '@/lib/AppError'
import { getNewEvents, getPastEvents } from '@/fetch/events'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

const tabs = ['upcoming', 'past']

export default function EventList() {
  const [upcomingEvents, setUpcomingEvents] = useState<HomeViewEvent[]>([])
  const [pastEvents, setPastEvents] = useState<HomeViewEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('upcoming')

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setLoading(true)
      try {
        await getNewEvents().then(setUpcomingEvents)
      } catch (error) {
        if (error instanceof AppError) {
          // TODO show error
        }
      }
      setLoading(false)
    }

    fetchUpcomingEvents()
  }, [])

  const handleTabChange = async (tab: string) => {
    setSelectedTab(tab)

    if (tab === 'past' && pastEvents.length === 0) {
      setLoading(true)
      try {
        await getPastEvents().then(setPastEvents)
      } catch (error) {
        if (error instanceof AppError) {
          // TODO show error
        }
      }
      setLoading(false)
    }
  }

  const events = selectedTab === 'upcoming' ? upcomingEvents : pastEvents
  const noEventText =
    selectedTab === 'upcoming' ? 'No upcoming events.' : 'No past events.'

  return (
    <div className="max-w-md space-y-4">
      <div className="text-2xl font-semibold text-primary">Events</div>

      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
        {tabs.map((tab) => (
          <li key={tab} className="me-2">
            <button
              role="tab"
              aria-selected={selectedTab === tab}
              className={classNames(
                'inline-block px-4 py-3 rounded-lg',
                selectedTab === tab
                  ? 'active text-white bg-secondary'
                  : 'hover:text-gray-900 hover:bg-secondary-200'
              )}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <LoadingSpinner sizeClasses="size-8" />
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {events.length === 0 && !loading && (
            <p className="text-gray-600 text-center">{noEventText}</p>
          )}

          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col bg-white border shadow-sm rounded-xl"
            >
              <div className="flex flex-row justify-between items-center border-b rounded-t-xl">
                <span className="py-3 px-4 md:px-5 text-lg font-bold text-gray-800">
                  {event.title}
                </span>
                {event.byMod && (
                  <span className="self-start p-3">
                    <svg
                      className="w-6 h-6 text-secondary"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2c-.791 0-1.55.314-2.11.874l-.893.893a.985.985 0 0 1-.696.288H7.04A2.984 2.984 0 0 0 4.055 7.04v1.262a.986.986 0 0 1-.288.696l-.893.893a2.984 2.984 0 0 0 0 4.22l.893.893a.985.985 0 0 1 .288.696v1.262a2.984 2.984 0 0 0 2.984 2.984h1.262c.261 0 .512.104.696.288l.893.893a2.984 2.984 0 0 0 4.22 0l.893-.893a.985.985 0 0 1 .696-.288h1.262a2.984 2.984 0 0 0 2.984-2.984V15.7c0-.261.104-.512.288-.696l.893-.893a2.984 2.984 0 0 0 0-4.22l-.893-.893a.985.985 0 0 1-.288-.696V7.04a2.984 2.984 0 0 0-2.984-2.984h-1.262a.985.985 0 0 1-.696-.288l-.893-.893A2.984 2.984 0 0 0 12 2Zm3.683 7.73a1 1 0 1 0-1.414-1.413l-4.253 4.253-1.277-1.277a1 1 0 0 0-1.415 1.414l1.985 1.984a1 1 0 0 0 1.414 0l4.96-4.96Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
              <div className="p-4 md:p-5">
                <div className="text-gray-700">
                  {eventTime(event.startTimestamp, event.endTimestamp)}
                </div>
                <div className="text-gray-500">
                  {nowToTimestamp(event.startTimestamp)}
                </div>
                <Link
                  href={`/event?e=${event.id}`}
                  className="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-secondary decoration-2 hover:text-primary hover:underline focus:underline focus:outline-none focus:text-primary disabled:opacity-50 disabled:pointer-events-none"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
