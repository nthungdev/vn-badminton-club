'use client'

import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { HomeViewEvent } from '@/lib/firebase/definitions/event'
import LoadingSpinner from '@/components/LoadingSpinner'
import AppError from '@/lib/AppError'
import { getJoinedEvents, getNewEvents, getPastEvents } from '@/fetch/events'
import { useAuth } from '@/app/contexts/AuthContext'
import EventCard from '@/components/EventCard'

export default function EventList() {
  const [upcomingEvents, setUpcomingEvents] = useState<HomeViewEvent[]>([])
  const [pastEvents, setPastEvents] = useState<HomeViewEvent[]>([])
  const [joinedEvents, setJoinedEvents] = useState<HomeViewEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('upcoming')
  const { user } = useAuth()

  const isAuthenticated = user !== null
  const tabs = ['upcoming', 'past'].concat(isAuthenticated ? ['joined'] : [])

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

    setLoading(true)
    if (tab === 'past' && pastEvents.length === 0) {
      try {
        await getPastEvents().then(setPastEvents)
      } catch (error) {
        if (error instanceof AppError) {
          // TODO show error ?
        }
        console.log({ error })
      }
    } else if (tab === 'joined' && joinedEvents.length === 0) {
      try {
        await getJoinedEvents().then(setJoinedEvents)
      } catch (error) {
        if (error instanceof AppError) {
          // TODO show error ?
        }
        console.log({ error })
      }
    }
    setLoading(false)
  }

  const eventsMap: Record<string, HomeViewEvent[]> = {
    upcoming: upcomingEvents,
    past: pastEvents,
    joined: joinedEvents,
  }
  const events = eventsMap[selectedTab] || []
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
                  ? 'active text-white bg-secondary font-semibold'
                  : 'hover:text-secondary hover:bg-secondary-200'
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
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      )}
    </div>
  )
}
