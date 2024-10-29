import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import useErrorHandler from '@/hooks/useErrorHandler'
import AppError from '@/lib/AppError'
import { menuHref } from '@/lib/menu'
import {
  CreatedEvent,
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'
import {
  BUTTON_CANCEL,
  BUTTON_CANCEL_EVENT_CONFIRM,
  BUTTON_CONFIRM_CANCEL_EVENT_CONFIRM_HAS_PARTICIPANTS,
} from '@/lib/constants/events'
import { hasPassed } from '@/lib/utils/events'
import { useAuth } from '@/contexts/AuthContext'
import { Role } from '@/firebase/definitions'

interface CancelEventButtonProps extends ComponentProps<'button'> {
  pending?: boolean
  event: CreatedEvent
  participants: (EventParticipant | FirestoreEventGuest)[]
  onPending: (pending: boolean) => void
}

export default function CancelEventButton(props: CancelEventButtonProps) {
  const { onPending, event, ...restProps } = props
  const router = useRouter()
  const handleError = useErrorHandler()
  const { user } = useAuth()

  const isMod = user?.role === Role.Mod
  const isOrganizer = user?.uid === event.organizer.uid
  const isPastEvent = hasPassed(event.startTimestamp)
  const hasParticipants = props.participants.length > 0
  const showCancelButton = !isPastEvent && (isMod || isOrganizer)
  const disableCancelButton = props.pending || isPastEvent

  const handleCancelEvent = async () => {
    const confirmed = window.confirm(
      hasParticipants
        ? BUTTON_CONFIRM_CANCEL_EVENT_CONFIRM_HAS_PARTICIPANTS
        : BUTTON_CANCEL_EVENT_CONFIRM
    )
    if (!confirmed) {
      return
    }

    try {
      onPending(true)
      const { success } = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }).then((r) => r.json())
      if (!success) {
        throw new AppError('Failed to cancel event')
      }
      router.replace(menuHref.home)
    } catch (error) {
      handleError(error)
    } finally {
      onPending(false)
    }
  }

  if (!showCancelButton) {
    return null
  }

  return (
    <button
      {...restProps}
      type="button"
      className={classNames(
        'w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border text-red-700 focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-white hover:text-white hover:bg-red-700 transition-colors focus:ring ring-red-400'
      )}
      onClick={handleCancelEvent}
      disabled={disableCancelButton}
    >
      {BUTTON_CANCEL}
    </button>
  )
}
