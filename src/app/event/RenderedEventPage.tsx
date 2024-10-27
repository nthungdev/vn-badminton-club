'use client'

import { useState } from 'react'
import { Tooltip } from 'flowbite-react'
import Link from 'next/link'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { addGuest, kick, kickGuest } from '@/fetch/events'
import {
  CreatedEvent,
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'
import { eventTime } from '@/lib/format'
import { menuHref } from '@/lib/menu'
import AppError from '@/lib/AppError'
import useErrorHandler from '@/hooks/useErrorHandler'
import { GroupedParticipants } from './types'
import JoinLeaveEventButton from './JoinLeaveEventButton'
import KickParticipantModal from './KickParticipantModal'
import CancelEventButton from './CancelEventButton'
import ParticipantActionButton from './ParticipantActionButton'
import GroupedParticipantList from './GroupedParticipantList'
import {
  DEFAULT_EVENT_CUTOFF,
  isEventParticipant,
  isFirestoreEventGuest,
  isPast,
} from '@/lib/utils/events'
import { useAuth } from '@/contexts/AuthContext'
import {
  BUTTON_ADD_GUEST,
  BUTTON_CONFIRM_ADD_GUEST_PAST_EVENT_CUTOFF,
  BUTTON_KICK_PAST_EVENT_CUTOFF,
  BUTTON_EDIT,
} from '@/lib/constants/events'
import { Role } from '@/firebase/definitions'

interface RenderedEventPageProps {
  event: CreatedEvent
}

export default function RenderedEventPage(props: RenderedEventPageProps) {
  const { event } = props
  const { user } = useAuth()
  const handleError = useErrorHandler()
  const [participants, setParticipants] = useState<
    (EventParticipant | FirestoreEventGuest)[]
  >([...event.participants, ...event.guests])
  const [pending, setPending] = useState(false)
  const [kickMode, setKickMode] = useState(false)
  const [updateMode, setUpdateMode] = useState(false)

  const isMod = user?.role === Role.Mod
  const isOrganizer = user?.uid === event.organizer.uid
  const isEventFull = participants.length >= event.slots
  const isPastEvent = dayjs().isAfter(dayjs(event.startTimestamp))
  const time = eventTime(event.startTimestamp, event.endTimestamp)
  const isPastEventCutoff = isPast(event.endTimestamp, DEFAULT_EVENT_CUTOFF)

  const isOnlySelfParticipant =
    participants.length === 1 &&
    participants.some((p) => isEventParticipant(p) && p.uid === user!.uid)
  // const hasMyGuests = participants.some(
  //   (p) => isFirestoreEventGuest(p) && p.addedBy === user!.uid
  // )
  const showKickButton =
    !isPastEvent &&
    participants.length > 0 &&
    !isOnlySelfParticipant &&
    (isMod || isOrganizer)
  const showAddGuestButton = !isPastEvent
  const showEditButton = !isPastEvent && (isMod || isOrganizer)
  const showCancelButton = !isPastEvent && (isMod || isOrganizer)
  const showJoinButton = !isPastEvent
  const kickableParticipants = participants.filter((p) => {
    if (isEventParticipant(p) && p.uid === user!.uid) {
      return false
    }

    if (isMod || isOrganizer) {
      // Mod and organizer can kick anyone
      return true
    } else {
      // Only show guests added by the current user
      return isFirestoreEventGuest(p) && p.addedBy === user!.uid
    }
  })
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
  const kickableParticipantsGrouped = kickableParticipants.reduce(
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

  async function handleAddGuest() {
    try {
      if (
        isPastEventCutoff &&
        !window.confirm(BUTTON_CONFIRM_ADD_GUEST_PAST_EVENT_CUTOFF)
      ) {
        return
      }

      const name = window.prompt('Enter the name of the guest you want to add:')
      if (name === null) {
        return
      }
      if (name === '') {
        throw new AppError('No name entered')
      }

      const guest = await addGuest(event.id, name)

      setParticipants([...participants, guest])
    } catch (error) {
      handleError(error)
    }
  }

  const handleKickParticipantToggle = () => {
    setKickMode(!kickMode)
  }

  const handleKick = async (
    participant: EventParticipant | FirestoreEventGuest
  ) => {
    try {
      setPending(true)
      if (isEventParticipant(participant)) {
        await kick(event.id, participant.uid)
        setParticipants(() => {
          const updated = participants.filter((p) =>
            isEventParticipant(p) ? p.uid !== participant.uid : true
          )
          if (updated.length === 0) {
            setKickMode(false)
          }
          return updated
        })
      } else {
        await kickGuest(event.id, participant.guestId)
        setParticipants(() => {
          const updated = participants.filter((p) =>
            isFirestoreEventGuest(p) ? p.guestId !== participant.guestId : true
          )
          if (updated.length === 0) {
            setKickMode(false)
          }
          return updated
        })
      }
    } catch (error) {
      handleError(error)
    } finally {
      setPending(false)
    }
  }

  const handleUpdateEventToggle = () => {
    setUpdateMode(!updateMode)
  }

  function renderKickParticipantButton() {
    return (
      <ParticipantActionButton
        onClick={handleKickParticipantToggle}
        disabled={kickMode || isPastEventCutoff}
      >
        Kick Participant
      </ParticipantActionButton>
    )
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
                {showKickButton &&
                  (isPastEventCutoff ? (
                    <Tooltip content={BUTTON_KICK_PAST_EVENT_CUTOFF}>
                      {renderKickParticipantButton()}
                    </Tooltip>
                  ) : (
                    renderKickParticipantButton()
                  ))}
                {showAddGuestButton && (
                  <ParticipantActionButton
                    onClick={handleAddGuest}
                    disabled={isEventFull || kickMode}
                  >
                    {BUTTON_ADD_GUEST}
                  </ParticipantActionButton>
                )}
              </div>
            </div>

            {showEditButton && (
              <div>
                <Link
                  href={`${menuHref.updateEvent}?e=${event.id}`}
                  type="button"
                  className={classNames(
                    'w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border text-secondary-700 focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-white hover:text-white hover:bg-secondary-700 focus:ring transition-colors'
                  )}
                  onClick={handleUpdateEventToggle}
                >
                  {BUTTON_EDIT}
                </Link>
              </div>
            )}

            {showCancelButton && (
              <div>
                <CancelEventButton
                  disabled={pending}
                  event={event}
                  participants={participants}
                  onPending={setPending}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showJoinButton && (
        <div className="p-4 shadow-inner">
          <JoinLeaveEventButton
            event={event}
            disabled={pending || undefined}
            participants={participants}
            onPending={setPending}
            onJoined={handleJoinedEvent}
            onLeft={handleLeftEvent}
          />
        </div>
      )}

      <KickParticipantModal
        show={kickMode}
        onClose={() => setKickMode(false)}
        onKick={handleKick}
        participantsGrouped={kickableParticipantsGrouped}
        disabled={pending}
      />
    </div>
  )
}
