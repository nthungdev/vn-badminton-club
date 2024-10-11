'use client'

import Link from 'next/link'
import { getNewEvents, getPastEvents } from '@/actions/events'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { HomeViewEvent } from '@/lib/firebase/definitions/event'
import LoadingSpinner from './LoadingSpinner'
import classNames from 'classnames'
import { eventTime, nowToTimestamp } from '@/lib/format'

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
      await getNewEvents().then(setUpcomingEvents)
      setLoading(false)
    }

    fetchUpcomingEvents()
  }, [])

  const handleTabChange = async (tab: string) => {
    setSelectedTab(tab)

    if (tab === 'past' && pastEvents.length === 0) {
      setLoading(true)
      await getPastEvents().then(setPastEvents)
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
        <div className="flex items-center justify-center">
          <LoadingSpinner sizeClasses="size-4" />
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
              <div className="flex justify-between items-center border-b rounded-t-xl py-3 px-4 md:px-5">
                <span className="text-lg font-bold text-gray-800">
                  {event.title}
                </span>
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
