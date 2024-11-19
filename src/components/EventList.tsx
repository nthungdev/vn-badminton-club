'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { HomeViewEvent } from '@/firebase/definitions/event'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getEvents } from '@/fetch/events'
import { useAuth } from '@/contexts/AuthContext'
import EventCard from '@/components/EventCard'
import useErrorHandler from '@/hooks/useErrorHandler'

type GetEventsFilter = 'new' | 'past' | 'joined'

const GET_LIMIT = 5
const GET_RETRY_LIMIT = 5

export default function EventList() {
  const handleError = useErrorHandler()
  const { user } = useAuth()

  const [newEvents, setNewEvents] = useState<HomeViewEvent[]>([])
  const [pastEvents, setPastEvents] = useState<HomeViewEvent[]>([])
  const [joinedEvents, setJoinedEvents] = useState<HomeViewEvent[]>([])

  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<GetEventsFilter>('new')
  const [loadedAll, setLoadedAll] = useState(false)
  const [retry, setRetry] = useState(0)
  const observerRef = useRef<HTMLDivElement | null>(null)

  const isAuthenticated = user !== null
  const tabs = ['new', 'past'].concat(isAuthenticated ? ['joined'] : [])

  const eventsMap: Record<
    string,
    {
      events: HomeViewEvent[]
      setter: React.Dispatch<React.SetStateAction<HomeViewEvent[]>>
    }
  > = {
    new: { events: newEvents, setter: setNewEvents },
    past: { events: pastEvents, setter: setPastEvents },
    joined: { events: joinedEvents, setter: setJoinedEvents },
  }
  const events = eventsMap[selectedTab].events
  const setEvents = eventsMap[selectedTab].setter

  const sortedPastEvents = events
    .filter((e) => e.startTimestamp.getTime() <= new Date().getTime())
    .toSorted((a, b) => b.startTimestamp.getTime() - a.startTimestamp.getTime())
  const sortedFutureEvents = events
    .filter((e) => e.startTimestamp.getTime() > new Date().getTime())
    .toSorted((a, b) => a.startTimestamp.getTime() - b.startTimestamp.getTime())

  const lastEvent = events.at(-1)

  const noEventText =
    selectedTab === 'new' ? 'No upcoming events.' : 'No past events.'

  const handleTabChange = async (tab: 'new' | 'past' | 'joined') => {
    setSelectedTab(tab)
    setLoadedAll(false)
    setRetry(0)
  }

  const getMoreEvents = useCallback(async () => {
    try {
      setLoading(true)
      const moreEvents = await getEvents({
        filter: selectedTab,
        limit: GET_LIMIT,
        startAfter: lastEvent?.startTimestamp.getTime(),
      })
      setEvents([...events, ...moreEvents])

      if (moreEvents.length === 0) {
        setLoadedAll(true)
        return
      }
    } catch (error) {
      if (retry === 0) {
        handleError(error)
      }
      setRetry((retry) => retry + 1)
    } finally {
      setLoading(false)
    }
  }, [
    events,
    selectedTab,
    lastEvent?.startTimestamp,
    retry,
    handleError,
    setEvents,
  ])

  useEffect(() => {
    const initialGetEvents = getMoreEvents
    initialGetEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          !loadedAll &&
          retry < GET_RETRY_LIMIT
        ) {
          console.log('get more events')
          getMoreEvents()
        }
      },
      { threshold: 1.0 }
    )

    const currentRef = observerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [loading, loadedAll, retry, getMoreEvents])

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
                'inline-block px-4 py-3 rounded-lg ',
                selectedTab === tab
                  ? 'active text-white bg-secondary font-semibold'
                  : 'hover:text-secondary hover:bg-secondary-200'
              )}
              onClick={() => handleTabChange(tab as GetEventsFilter)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-8">
        {events.length === 0 && !loading && (
          <p className="text-gray-600 text-center">{noEventText}</p>
        )}

        {sortedFutureEvents.length !== 0 && (
          <div className="space-y-2">
            <div className="text-xl text-secondary font-semibold ml-1">
              Upcoming
            </div>
            <div className="space-y-4">
              {sortedFutureEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
        )}

        {sortedPastEvents.length !== 0 && (
          <div className="space-y-2">
            <div className="text-xl text-secondary font-semibold ml-1">
              Past
            </div>
            <div className="space-y-4">
              {sortedPastEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={observerRef}></div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <LoadingSpinner sizeClasses="size-8" />
        </div>
      )}
    </div>
  )
}
