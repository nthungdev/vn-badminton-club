'use client'

import { ParticipateEventButton } from '@/components/ParticipateEventButton'
import { EventParticipant } from '@/lib/firebase/definitions/event'
import { menuHref } from '@/lib/menu'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface RenderedEventPageProps {
  eventId: string
  title: string
  organizerDisplayName: string
  time: string
  slots: number
  participants: EventParticipant[]
  showJoinButton: boolean
  selfParticipant: EventParticipant
  showCancelButton: boolean
}

export default function RenderedEventPage(props: RenderedEventPageProps) {
  const router = useRouter()
  const [participants, setParticipants] = useState(props.participants)
  const [pending, setPending] = useState(false)
  const [kickMode, setKickMode] = useState(false)

  const handleParticipateButton = async () => {
    if (joined) {
      const confirmed = window.confirm(
        'Are you sure you want to leave this event?'
      )
      if (!confirmed) {
        return
      }
    }

    try {
      const url = joined ? '/api/event/leave' : '/api/event/join'
      setPending(true)
      await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: props.eventId }),
      })

      setParticipants(
        joined
          ? participants.filter((p) => p.uid !== props.selfParticipant.uid)
          : [...participants, props.selfParticipant]
      )
    } catch (error) {
      console.error('Error joining event:', error)
    } finally {
      setPending(false)
    }
  }

  const handleKickParticipantToggle = () => {
    setKickMode(!kickMode)
  }

  const handleKick = async (uid: string) => {
    try {
      const url = '/api/event/kick'
      setPending(true)
      const { error } = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: props.eventId, uid }),
      }).then((res) => res.json())

      if (error) {
        throw new Error(error.message)
      }

      setParticipants(() => {
        const updated = participants.filter((p) => p.uid !== uid)
        if (
          updated.length === 0 ||
          (updated.length === 1 &&
            updated.some((p) => p.uid === props.selfParticipant.uid))
        ) {
          setKickMode(false)
        }
        return updated
      })
    } catch (error) {
      console.error('Error kicking participant:', error)
      window.alert('Error kicking participant')
    } finally {
      setPending(false)
    }
  }

  const handleCancelEvent = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this event?'
    )
    if (!confirmed) {
      return
    }

    try {
      setPending(true)
      await fetch('/api/event', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: props.eventId }),
      })
      router.replace(menuHref.home)
    } catch (error) {
      console.error('Error canceling event:', error)
      window.alert('Error canceling event')
    } finally {
      setPending(false)
    }
  }

  const kickToggleText = kickMode ? 'Cancel' : 'Kick Participant'
  const joined = participants.some((p) => p.uid === props.selfParticipant.uid)
  const showKickButton =
    participants.length > 0 &&
    !(
      participants.length === 1 &&
      participants.some((p) => p.uid === props.selfParticipant.uid)
    )
  // const showCancelButton = props.selfParticipant.uid === props.

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4 flex-1 overflow-hidden">
        <div className="max-w-md mx-auto">
          <div>
            <div className="text-gray-600 text-center text-sm">Event</div>
            <h1 className="text-xl font-bold text-center text-primary">
              {props.title}
            </h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-semibold">Organizer</span>
              <div className="p-4 bg-white border shadow-sm rounded-xl">
                <div className="text-center">{props.organizerDisplayName}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold">Time</span>
              <div className="p-4 bg-white border shadow-sm rounded-xl">
                <div className="text-center">{props.time}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-row justify-between">
                <span className="font-semibold">Participants</span>
                <span className="text-right w-full font-semibold text-primary">
                  {participants.length} / {props.slots}
                </span>
              </div>
              {kickMode && (
                <div className="p-4 bg-white border shadow-sm rounded-xl space-y-1">
                  <ul className="space-y-1 flex flex-col justify-center items-center">
                    {participants.map((participant, index) => (
                      <li
                        key={index}
                        id="badge-dismiss-default"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-secondary-800 rounded"
                      >
                        {participant.displayName}
                        <button
                          type="button"
                          className="inline-flex items-center p-1 ms-2 text-sm text-secondary-300 bg-transparent rounded-sm hover:bg-secondary-200 hover:text-secondary-900"
                          data-dismiss-target="#badge-dismiss-default"
                          aria-label="Remove"
                          onClick={() => handleKick(participant.uid)}
                          disabled={pending}
                        >
                          <svg
                            className="w-2 h-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                          </svg>
                          <span className="sr-only">Remove badge</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!kickMode && (
                <div className="p-4 bg-white border shadow-sm rounded-xl space-y-1">
                  {participants.length === 0 && (
                    <div className="text-center text-gray-600">
                      No one has joined this event.
                    </div>
                  )}
                  {participants.length > 0 && (
                    <ul className="space-y-1">
                      {participants.map((participant, index) => (
                        <li key={index} className="text-center">
                          {participant.displayName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {showKickButton && (
                <div className="flex flex-row justify-end">
                  <button
                    className={classNames(
                      'py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-white focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
                      kickMode
                        ? 'bg-red-600 hover:bg-red-700 focus:bg-red-700'
                        : 'bg-secondary hover:bg-secondary-700 focus:bg-secondary-700'
                    )}
                    onClick={handleKickParticipantToggle}
                  >
                    {kickToggleText}
                  </button>
                </div>
              )}
            </div>

            {props.showCancelButton && (
              <div>
                <button
                  type="button"
                  className={classNames(
                    'w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border text-red-700 focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-white hover:text-white focus:text-white hover:bg-red-700 focus:bg-red-700'
                  )}
                  disabled={pending}
                  onClick={() => handleCancelEvent()}
                >
                  Cancel Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {props.showJoinButton && (
        <div className="p-4 shadow-inner">
          <ParticipateEventButton
            joined={joined}
            disabled={pending}
            onClick={handleParticipateButton}
          />
        </div>
      )}
    </div>
  )
}
