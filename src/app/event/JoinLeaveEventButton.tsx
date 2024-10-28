'use client'

import { useAuth } from '@/contexts/AuthContext'
import { joinEvent, leaveEvent } from '@/fetch/events'
import {
  CreatedEvent,
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'
import useErrorHandler from '@/hooks/useErrorHandler'
import {
  BUTTON_CONFIRM_JOIN_PAST_EVENT_CUTOFF,
  BUTTON_JOIN,
  BUTTON_LEAVE,
  BUTTON_LEAVE_EVENT_CONFIRM,
} from '@/lib/constants/events'
import {
  DEFAULT_EVENT_CUTOFF,
  isEventParticipant,
  isPast,
} from '@/lib/utils/events'
import classNames from 'classnames'
import { Tooltip } from 'flowbite-react'
import { ComponentProps } from 'react'

interface JoinLeaveEventButtonProps extends ComponentProps<'button'> {
  event: CreatedEvent
  participants: (EventParticipant | FirestoreEventGuest)[]
  onPending: (pending: boolean) => void
  onJoined: () => void
  onLeft: () => void
}

export default function JoinLeaveEventButton(props: JoinLeaveEventButtonProps) {
  const handleError = useErrorHandler()
  const { user } = useAuth()

  const isPastLeaveTime = isPast(props.event.endTimestamp, DEFAULT_EVENT_CUTOFF)
  const meJoined = props.participants.some(
    (p) => isEventParticipant(p) && p.uid === user?.uid
  )
  const buttonText = meJoined ? BUTTON_LEAVE : BUTTON_JOIN
  const isEventFull = props.participants.length >= props.event.slots
  const shouldDisable = props.disabled || (!meJoined && isEventFull) || isPastLeaveTime

  const handleClick = async () => {
    try {
      props.onPending(true)

      if (meJoined) {
        if (!window.confirm(BUTTON_LEAVE_EVENT_CONFIRM)) {
          return
        }

        await leaveEvent(props.event.id)
        props.onLeft()
      } else {
        if (
          isPastLeaveTime &&
          !window.confirm(BUTTON_CONFIRM_JOIN_PAST_EVENT_CUTOFF)
        ) {
          return
        }

        await joinEvent(props.event.id)
        props.onJoined()
      }
    } catch (error) {
      handleError(error)
    } finally {
      props.onPending(false)
    }
  }

  function renderButton() {
    return (
      <button
        type="button"
        className={classNames(
          'mx-auto max-w-lg w-full py-3 px-4 flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-white focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-colors',
          shouldDisable && 'cursor-not-allowed',
          meJoined
            ? 'bg-red-600 hover:bg-red-700 focus:bg-red-700'
            : 'bg-primary hover:bg-primary-700 focus:bg-primary-700'
        )}
        disabled={shouldDisable}
        onClick={handleClick}
      >
        {buttonText}
      </button>
    )
  }

  if (meJoined && isPastLeaveTime) {
    return (
      <Tooltip
        content="Because it's close to the event's start time, you cannot leave this event."
        theme={{
          target: 'w-full max-w-lg mx-auto',
        }}
      >
        {renderButton()}
      </Tooltip>
    )
  }

  return renderButton()
}
