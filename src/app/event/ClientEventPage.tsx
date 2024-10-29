'use client'

import { useState } from 'react'
import { Tooltip } from 'flowbite-react'
import Link from 'next/link'
import classNames from 'classnames'
import {
  CreatedEvent,
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'
import { eventTime } from '@/lib/format'
import { menuHref } from '@/lib/menu'
import { GroupedParticipants } from './types'
import JoinLeaveEventButton from './JoinLeaveEventButton'
import CancelEventButton from './CancelEventButton'
import GroupedParticipantList from './GroupedParticipantList'
import {
  isEventParticipant,
  isFirestoreEventGuest,
  hasPassed,
} from '@/lib/utils/events'
import { useAuth } from '@/contexts/AuthContext'
import { BUTTON_EDIT } from '@/lib/constants/events'
import { Role } from '@/firebase/definitions'
import KickParticipantButton from './KickParticipantButton'
import AddGuestButton from './AddGuestButton'

interface ClientEventPageProps {
  eventId: string
  event: CreatedEvent
}

export default function ClientEventPage(props: ClientEventPageProps) {
  const { event } = props
  const { user } = useAuth()

  const [participants, setParticipants] = useState<
    (EventParticipant | FirestoreEventGuest)[]
  >([...event.participants, ...event.guests])
  const [pending, setPending] = useState(false)

  const isMod = user?.role === Role.Mod
  const isOrganizer = user?.uid === event.organizer.uid
  const isPastEvent = hasPassed(event.startTimestamp)
  const time = eventTime(event.startTimestamp, event.endTimestamp)

  const meJoined = participants.some(
    (p) => isEventParticipant(p) && p.uid === user?.uid
  )

  const showEditButton = (isMod || !isPastEvent) && (isMod || isOrganizer)
  const showJoinLeaveButton =
    (!meJoined && !isPastEvent) || (meJoined && (isMod || !isPastEvent))

  const disableJoinLeaveButton = pending || undefined

  const participantsGrouped = participants.reduce(
    (prev, curr) => {
      if (isEventParticipant(curr)) {
        return { ...prev, users: [...prev.users, curr] }
      } else if (isFirestoreEventGuest(curr)) {
        return {
          ...prev,
          userGuests: {
            ...prev.userGuests,
            [curr.addedBy]: {
              ...prev.userGuests[curr.addedBy],
              userDisplayName: curr.userDisplayName,
              guests: [...(prev.userGuests[curr.addedBy]?.guests || []), curr],
            },
          },
        }
      }
      return prev
    },
    {
      users: [],
      userGuests: {},
    } as GroupedParticipants
  )

  const handleJoinedEvent = () => {
    setParticipants([
      ...participants,
      {
        uid: user!.uid,
        displayName: user!.displayName || '',
      },
    ])
  }

  const handleLeftEvent = () => {
    setParticipants(
      participants.filter((p) => isEventParticipant(p) && p.uid !== user!.uid)
    )
  }

  function handleGuestAdded(guest: FirestoreEventGuest) {
    setParticipants([...participants, guest])
  }

  function handleKicked(
    participants: (EventParticipant | FirestoreEventGuest)[]
  ) {
    setParticipants(participants)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-10">
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
                <div className="text-center">
                  {event.organizer.displayName}
                  {event.byMod && (
                    <span>
                      <Tooltip
                        className="inline-block bg-secondary"
                        content="Moderator"
                        theme={{
                          target: 'inline-block',
                          arrow: {
                            style: {
                              dark: 'bg-secondary',
                              light: 'bg-secondary',
                              auto: 'bg-secondary',
                            },
                          },
                        }}
                      >
                        <div className="ml-1 inline-block hover:cursor-pointer align-top">
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
                        </div>
                      </Tooltip>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold">Time</span>
              <div className="p-4 bg-white border shadow-sm rounded-xl">
                <div className="text-center">{time}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-row justify-between">
                <span className="font-semibold">Participants</span>
                <span className="text-right w-full font-semibold text-primary">
                  {participants.length} / {event.slots}
                </span>
              </div>
              <div className="px-4 py-2 bg-white border shadow-sm rounded-xl divide-y-2">
                <GroupedParticipantList
                  participantsGrouped={participantsGrouped}
                />
              </div>
              <div className="flex flex-row justify-end space-x-2">
                <KickParticipantButton
                  event={event}
                  participants={participants}
                  setPending={setPending}
                  onKicked={handleKicked}
                />

                <AddGuestButton
                  event={event}
                  onGuestAdded={handleGuestAdded}
                  participants={participants}
                  setPending={setPending}
                  pending={pending}
                />
              </div>
            </div>

            <div className="space-y-2">
              {showEditButton && (
                <Link
                  href={`${menuHref.updateEvent}?e=${event.id}`}
                  type="button"
                  className={classNames(
                    'w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border text-secondary-700 focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-white hover:text-white hover:bg-secondary-700 focus:ring transition-colors'
                  )}
                >
                  {BUTTON_EDIT}
                </Link>
              )}

              <CancelEventButton
                event={event}
                participants={participants}
                pending={pending}
                onPending={setPending}
              />
            </div>
          </div>
        </div>
      </div>

      {showJoinLeaveButton && (
        <div className="p-4 shadow-inner">
          <JoinLeaveEventButton
            event={event}
            disabled={disableJoinLeaveButton}
            participants={participants}
            onPending={setPending}
            onJoined={handleJoinedEvent}
            onLeft={handleLeftEvent}
          />
        </div>
      )}
    </div>
  )
}
