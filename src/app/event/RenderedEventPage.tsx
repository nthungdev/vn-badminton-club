'use client'

import { ComponentProps, MouseEventHandler, useState } from 'react'
import { Modal, Tooltip } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { JoinLeaveEventButton } from '@/app/event/ParticipateEventButton'
import {
  addGuest,
  joinEvent,
  kick,
  kickGuest,
  leaveEvent,
} from '@/fetch/events'
import {
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'
import { eventTime } from '@/lib/format'
import { menuHref } from '@/lib/menu'
import { UNKNOWN_ERROR } from '@/constants/errorMessages'
import { useToastsContext } from '../../contexts/ToastsContext'
import AppError from '@/lib/AppError'

interface GroupedParticipants {
  users: EventParticipant[]
  userGuests: Record<
    string,
    {
      userDisplayName: string
      guests: FirestoreEventGuest[]
    }
  >
}

interface KickListProps {
  disabled?: boolean
  participants: (EventParticipant | FirestoreEventGuest)[]
  onKick: (participant: EventParticipant | FirestoreEventGuest) => void
}

function KickList(props: KickListProps) {
  return (
    <ul className="flex flex-wrap flex-row">
      {props.participants.map((participant, index) => (
        <li
          key={index}
          id="badge-dismiss-default"
          className="inline-flex items-center mr-2 my-1 px-3 py-1 font-medium text-white bg-secondary-700 rounded"
        >
          {participant.displayName}
          <button
            type="button"
            className="inline-flex items-center p-1 ms-2 text-sm text-secondary-300 bg-transparent rounded-sm hover:bg-secondary-200 hover:text-secondary-900"
            data-dismiss-target="#badge-dismiss-default"
            aria-label="Remove"
            onClick={() => props.onKick(participant)}
            disabled={props.disabled}
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
  )
}

function KickModal({
  show,
  onClose,
  participantsGrouped,
  selfParticipant,
  onKick,
  disabled,
}: {
  show: boolean
  onClose: () => void
  participantsGrouped: GroupedParticipants
  disabled?: boolean
  selfParticipant: EventParticipant
  onKick: (participant: EventParticipant | FirestoreEventGuest) => void
}) {
  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>
        <span>Kick Participants</span>
      </Modal.Header>
      <Modal.Body className="py-2">
        <div className="divide-y-2">
          {participantsGrouped.users.length > 0 && (
            <div className="space-y-1 py-3">
              <div className="text-xl font-bold">Users</div>
              <KickList
                participants={participantsGrouped.users}
                onKick={onKick}
                disabled={disabled}
              />
            </div>
          )}

          <div className="divide-y-2">
            {Object.entries(participantsGrouped.userGuests).map(
              ([userId, guestData]) => (
                <div key={userId} className="space-y-1 py-3">
                  <div className="text-lg">
                    <span className="font-bold">
                      {userId === selfParticipant.uid
                        ? 'My'
                        : `${guestData.userDisplayName}'s`}
                    </span>{' '}
                    Guests
                  </div>
                  <KickList
                    participants={guestData.guests}
                    onKick={onKick}
                    disabled={disabled}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

interface RenderedEventPageProps {
  eventId: string
  title: string
  byMod: boolean
  organizerDisplayName: string
  startTimestamp: Date
  endTimestamp: Date
  slots: number
  participants: EventParticipant[]
  guests: FirestoreEventGuest[]
  selfParticipant: EventParticipant
  showJoinButton: boolean
  showCancelButton: boolean
  showUpdateButton: boolean
}

function isEventParticipant(
  participant: EventParticipant | FirestoreEventGuest
): participant is EventParticipant {
  return (participant as EventParticipant).uid !== undefined
}

function isFirestoreEventGuest(
  participant: EventParticipant | FirestoreEventGuest
): participant is FirestoreEventGuest {
  return (participant as FirestoreEventGuest).guestId !== undefined
}

export default function RenderedEventPage(props: RenderedEventPageProps) {
  const router = useRouter()
  const { addToast } = useToastsContext()
  const [participants, setParticipants] = useState<
    (EventParticipant | FirestoreEventGuest)[]
  >([...props.participants, ...props.guests])
  const [pending, setPending] = useState(false)
  const [kickMode, setKickMode] = useState(false)
  const [updateMode, setUpdateMode] = useState(false)

  const isEventFull = participants.length >= props.slots
  const isPastEvent = dayjs().isAfter(dayjs(props.startTimestamp))
  const time = eventTime(props.startTimestamp, props.endTimestamp)
  const kickToggleText = 'Kick Participant'
  const meJoined = participants.some(
    (p) => isEventParticipant(p) && p.uid === props.selfParticipant.uid
  )
  const shouldDisableParticipateButton =
    pending && meJoined ? true : isEventFull
  const isOnlySelfParticipant =
    participants.length === 1 &&
    participants.some(
      (p) => isEventParticipant(p) && p.uid === props.selfParticipant.uid
    )
  const hasMyGuests = participants.some(
    (p) => isFirestoreEventGuest(p) && p.addedBy === props.selfParticipant.uid
  )
  const showKickButton =
    !isPastEvent &&
    participants.length > 0 &&
    !isOnlySelfParticipant &&
    (props.showUpdateButton || hasMyGuests)
  const showAddGuestButton = !isPastEvent
  const kickableParticipants = participants.filter((p) => {
    if (isEventParticipant(p) && p.uid === props.selfParticipant.uid) {
      return false
    }

    if (props.showUpdateButton) {
      // Mod and organizer can kick anyone
      return true
    } else {
      // Only show guests added by the current user
      return isFirestoreEventGuest(p) && p.addedBy === props.selfParticipant.uid
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

  function handleError(error: unknown) {
    if (error instanceof AppError) {
      addToast({
        message: error.message,
        type: 'error',
      })
    } else {
      addToast({
        message: UNKNOWN_ERROR,
        type: 'error',
      })
    }
  }

  const handleParticipateButton = async () => {
    if (meJoined) {
      const confirmed = window.confirm(
        'Are you sure you want to leave this event?'
      )
      if (!confirmed) {
        return
      }
    }

    try {
      setPending(true)

      if (meJoined) {
        await leaveEvent(props.eventId)
      } else {
        await joinEvent(props.eventId)
      }
      setParticipants(
        meJoined
          ? participants.filter(
              (p) =>
                isEventParticipant(p) && p.uid !== props.selfParticipant.uid
            )
          : [...participants, props.selfParticipant]
      )
    } catch (error) {
      handleError(error)
    } finally {
      setPending(false)
    }
  }

  async function handleAddGuest() {
    try {
      const name = window.prompt('Enter the name of the guest you want to add:')
      if (name === null) {
        return
      }
      if (name === '') {
        throw new AppError('No name entered')
      }

      const guest = await addGuest(props.eventId, name)

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
        await kick(props.eventId, participant.uid)
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
        await kickGuest(props.eventId, participant.guestId)
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

  const handleCancelEvent = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this event?'
    )
    if (!confirmed) {
      return
    }

    try {
      setPending(true)
      const { success } = await fetch(`/api/events/${props.eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }).then((r) => r.json())
      if (!success) {
        throw new Error('Failed to cancel event')
      }
      router.replace(menuHref.home)
    } catch (error) {
      handleError(error)
    } finally {
      setPending(false)
    }
  }

  const handleUpdateEventToggle = () => {
    setUpdateMode(!updateMode)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-10">
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
                <div className="text-center">
                  {props.organizerDisplayName}
                  {props.byMod && (
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
                  {participants.length} / {props.slots}
                </span>
              </div>
              <div className="px-4 py-2 bg-white border shadow-sm rounded-xl divide-y-2">
                {participants.length === 0 && (
                  <div className="text-center text-gray-600">
                    No one has joined this event.
                  </div>
                )}
                {participantsGrouped.users.length > 0 && (
                  <ul className="space-y-1 flex flex-col py-2">
                    {participantsGrouped.users.map((participant, index) => (
                      <li key={index} className="px-3 py-1">
                        <span className="font-medium text-secondary-700">
                          {participant.displayName}
                        </span>
                        {isFirestoreEventGuest(participant) && (
                          <span className="text-gray-600">
                            <br />
                            {`(${participant.userDisplayName}'s guest)`}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {Object.entries(participantsGrouped.userGuests).map(
                  ([userId, guestData]) => (
                    <div key={userId} className="px-3 py-2 space-y-1">
                      <div className="font-medium text-gray-600">
                        {guestData.userDisplayName}&apos;s guests
                      </div>
                      <ul key={userId} className="space-y-1 flex flex-col">
                        {guestData.guests.map((guest, index) => (
                          <li key={index} className="py-1">
                            <span className="font-medium text-secondary-700">
                              {guest.displayName}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
              <div className="flex flex-row justify-end space-x-2">
                {showKickButton && (
                  <ParticipantActionButton
                    onClick={handleKickParticipantToggle}
                    disabled={isPastEvent || kickMode}
                  >
                    {kickToggleText}
                  </ParticipantActionButton>
                )}
                {showAddGuestButton && (
                  <ParticipantActionButton
                    onClick={handleAddGuest}
                    disabled={isEventFull || kickMode}
                  >
                    Add Guest
                  </ParticipantActionButton>
                )}
              </div>
            </div>

            {props.showUpdateButton && (
              <div>
                <Link
                  href={`${menuHref.updateEvent}?e=${props.eventId}`}
                  type="button"
                  className={classNames(
                    'w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border text-secondary-700 focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-white hover:text-white focus:text-white hover:bg-secondary-700 focus:bg-secondary-700 transition-colors'
                  )}
                  onClick={handleUpdateEventToggle}
                >
                  Update Event
                </Link>
              </div>
            )}

            {props.showCancelButton && (
              <div>
                <CancelEventButton
                  disabled={pending}
                  onClick={() => handleCancelEvent()}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {props.showJoinButton && (
        <div className="p-4 shadow-inner">
          <JoinLeaveEventButton
            joined={meJoined}
            disabled={shouldDisableParticipateButton}
            onClick={handleParticipateButton}
          />
        </div>
      )}

      <KickModal
        show={kickMode}
        onClose={() => setKickMode(false)}
        onKick={handleKick}
        participantsGrouped={kickableParticipantsGrouped}
        selfParticipant={props.selfParticipant}
        disabled={pending}
      />
    </div>
  )
}

function CancelEventButton({
  disabled,
  onClick,
}: {
  disabled?: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
}) {
  return (
    <button
      type="button"
      className={classNames(
        'w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border text-red-700 focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-white hover:text-white focus:text-white hover:bg-red-700 focus:bg-red-700 transition-colors'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      Cancel Event
    </button>
  )
}

function ParticipantActionButton(props: ComponentProps<'button'>) {
  const { children, className, ...restProps } = props

  return (
    <button
      {...restProps}
      className={classNames(
        'py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-colors text-secondary-700 hover:text-white focus:text-white hover:bg-secondary-700 focus:bg-secondary-700',
        className
      )}
    >
      {children}
    </button>
  )
}
