'use client'

import { ParticipateEventButton } from '@/components/ParticipateEventButton'
import { EventParticipant } from '@/lib/firebase/definitions/event'
import { useState } from 'react'

interface RenderedEventPageProps {
  eventId: string
  title: string
  organizerDisplayName: string
  time: string
  slots: number
  participants: EventParticipant[]
  showJoinButton: boolean
  eventJoined: boolean
  selfParticipant: EventParticipant
}

export default function RenderedEventPage(props: RenderedEventPageProps) {
  const [participants, setParticipants] = useState(props.participants)
  const [joined, setJoined] = useState(props.eventJoined)
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: props.eventId }),
      })

      if (!joined) {
        setParticipants([...participants, props.selfParticipant])
      } else {
        setParticipants(
          participants.filter((p) => p.uid !== props.selfParticipant.uid)
        )
      }

      setJoined(!joined)
    } catch (error) {
      console.error('Error joining event:', error)
    } finally {
      setPending(false)
    }
  }

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
              <div className="p-4 bg-white border shadow-sm rounded-xl space-y-1">
                {participants.length === 0 && (
                  <div className="text-center text-gray-600">
                    No one has joined this event.
                  </div>
                )}
                {participants.length > 0 && (
                  <ul className="space-y-1">
                    {props.participants.map((participant, index) => (
                      <li key={index} className="text-center">
                        {participant.displayName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {props.showJoinButton && (
        <div className="p-4 shadow-inner">
          <ParticipateEventButton
            joined={joined}
            disabled={pending}
            onClick={handleClick}
          />
        </div>
      )}
    </div>
  )
}
