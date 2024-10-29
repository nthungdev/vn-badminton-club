'use client'

import { useAuth } from '@/contexts/AuthContext'
import { joinEvent, leaveEvent } from '@/fetch/events'
import { Role } from '@/firebase/definitions'
import {
  CreatedEvent,
  FirestoreEventParticipant,
} from '@/firebase/definitions/event'
import useErrorHandler from '@/hooks/useErrorHandler'
import {
  BUTTON_CONFIRM_JOIN_PASSED_EVENT_LEAVE_CUTOFF,
  BUTTON_JOIN,
  BUTTON_JOIN_PASSED_JOIN_CUTOFF_TOOLTIP,
  BUTTON_LEAVE,
  BUTTON_LEAVE_EVENT_CONFIRM,
  BUTTON_LEAVE_PASSED_LEAVE_CUTOFF_TOOLTIP,
} from '@/lib/constants/events'
import {
  hasPassed,
  DEFAULT_EVENT_JOIN_CUTOFF,
  DEFAULT_EVENT_LEAVE_CUTOFF,
} from '@/lib/utils/events'
import classNames from 'classnames'
import { Tooltip } from 'flowbite-react'
import { ComponentProps } from 'react'

interface JoinLeaveEventButtonContainerProps extends ComponentProps<'button'> {
  event: CreatedEvent
  participants: FirestoreEventParticipant[]
  pending?: boolean
  onPending: (pending: boolean) => void
  onJoined: () => void
  onLeft: () => void
}

export default function JoinLeaveEventButtonContainer(
  props: JoinLeaveEventButtonContainerProps
) {
  const handleError = useErrorHandler()
  const { user } = useAuth()

  const isPastEvent = hasPassed(props.event.startTimestamp)
  const hasPassedLeaveTime = hasPassed(
    props.event.startTimestamp,
    DEFAULT_EVENT_LEAVE_CUTOFF
  )
  const hasPassedJoinTime = hasPassed(
    props.event.startTimestamp,
    DEFAULT_EVENT_JOIN_CUTOFF
  )
  const meJoined = props.participants.some((p) => p.uid === user?.uid)
  const isMod = user?.role === Role.Mod
  const buttonText = meJoined ? BUTTON_LEAVE : BUTTON_JOIN
  const isEventFull = props.participants.length >= props.event.slots
  const showJoinLeaveButton =
    (!meJoined && !isPastEvent) || (meJoined && (isMod || !isPastEvent))
  const shouldDisable =
    props.pending ||
    props.disabled ||
    (!meJoined && isEventFull) ||
    hasPassedJoinTime

  const tooltipContent = (() => {
    if (isPastEvent) {
      return ''
    }

    if (!isMod && meJoined && hasPassedLeaveTime) {
      return BUTTON_LEAVE_PASSED_LEAVE_CUTOFF_TOOLTIP
    }

    if (!meJoined && hasPassedJoinTime) {
      return BUTTON_JOIN_PASSED_JOIN_CUTOFF_TOOLTIP
    }

    return ''
  })()

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
          hasPassedLeaveTime &&
          !window.confirm(BUTTON_CONFIRM_JOIN_PASSED_EVENT_LEAVE_CUTOFF)
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

  if (!showJoinLeaveButton) return null

  if (tooltipContent) {
    return (
      <div className="p-4 shadow-inner">
        <Tooltip
          content={tooltipContent}
          theme={{
            target: 'w-full max-w-lg mx-auto',
          }}
        >
          {renderButton()}
        </Tooltip>
      </div>
    )
  }

  return renderButton()
}
