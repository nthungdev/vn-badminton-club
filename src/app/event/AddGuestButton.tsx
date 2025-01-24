import { ComponentProps } from 'react'
import { Tooltip } from 'flowbite-react'
import ParticipantActionButton from './ParticipantActionButton'
import {
  CreatedEvent,
  FirestoreEventParticipant,
  FirestoreEventParticipantGuest,
} from '@/firebase/definitions/event'
import {
  DEFAULT_EVENT_JOIN_CUTOFF,
  DEFAULT_EVENT_LEAVE_CUTOFF,
  hasPassed,
} from '@/lib/utils/events'
import { Role } from '@/firebase/definitions'
import { useAuth } from '@/contexts/AuthContext'
import {
  BUTTON_ADD_GUEST,
  BUTTON_ADD_GUEST_PASSED_JOIN_CUTOFF_TOOLTIP,
  BUTTON_CONFIRM_ADD_GUEST_PAST_EVENT_LEAVE_CUTOFF,
  EVENT_ADD_GUEST_PROMPT,
} from '@/lib/constants/events'
import {
  EVENT_ADD_GUEST_NO_NAME_ERROR,
  EVENT_FULL_ERROR,
} from '@/constants/errorMessages'
import AppError from '@/lib/AppError'
import { addGuest } from '@/fetch/events'
import useErrorHandler from '@/hooks/useErrorHandler'

interface AddGuestButtonProps extends ComponentProps<'button'> {
  event: CreatedEvent
  participants: FirestoreEventParticipant[]
  pending?: boolean
  setPending: (pending: boolean) => void
  onGuestAdded: (guest: FirestoreEventParticipantGuest) => void
}

export default function AddGuestButton(props: AddGuestButtonProps) {
  const { event, pending, setPending, onGuestAdded, ...otherProps } = props

  const { user } = useAuth()
  const handleError = useErrorHandler()

  const isMod = user?.role === Role.Mod
  const isEventFull = props.participants.length >= event.slots
  const isPastEvent = hasPassed(event.startTimestamp)
  const hasPassedJoinCutoff = hasPassed(
    event.startTimestamp,
    DEFAULT_EVENT_JOIN_CUTOFF
  )
  const hasPassedLeaveCutoff = hasPassed(
    event.startTimestamp,
    DEFAULT_EVENT_LEAVE_CUTOFF
  )
  const showAddGuestButton = isMod || !isPastEvent
  const disableAddGuestButton =
    pending || (!isMod && (hasPassedJoinCutoff || isEventFull))

  const tooltipContent = (() => {
    if (isEventFull) {
      return EVENT_FULL_ERROR
    }

    if (!isMod && hasPassedJoinCutoff) {
      return BUTTON_ADD_GUEST_PASSED_JOIN_CUTOFF_TOOLTIP
    }

    return ''
  })()

  async function handleAddGuest() {
    try {
      if (
        !isMod &&
        hasPassedLeaveCutoff &&
        !window.confirm(BUTTON_CONFIRM_ADD_GUEST_PAST_EVENT_LEAVE_CUTOFF)
      ) {
        return
      }

      const name = window.prompt(EVENT_ADD_GUEST_PROMPT)
      if (name === null) {
        return
      }
      if (name === '') {
        throw new AppError(EVENT_ADD_GUEST_NO_NAME_ERROR)
      }

      setPending(true)
      const guest = await addGuest(event.id, name)
      onGuestAdded(guest)
    } catch (error) {
      handleError(error)
    } finally {
      setPending(false)
    }
  }

  function renderAddGuestButton() {
    return (
      <ParticipantActionButton
        {...otherProps}
        onClick={handleAddGuest}
        disabled={disableAddGuestButton}
      >
        {BUTTON_ADD_GUEST}
      </ParticipantActionButton>
    )
  }

  if (!showAddGuestButton) return null

  if (tooltipContent) {
    return <Tooltip content={tooltipContent}>{renderAddGuestButton()}</Tooltip>
  }

  return renderAddGuestButton()
}
