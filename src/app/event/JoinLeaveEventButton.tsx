'use client'

import { joinEvent, leaveEvent } from '@/fetch/events'
import useErrorHandler from '@/hooks/useErrorHandler'
import classNames from 'classnames'
import { ComponentProps } from 'react'

interface JoinLeaveEventButtonProps extends ComponentProps<'button'> {
  eventId: string
  joined: boolean
  onPending: (pending: boolean) => void
  onJoined: () => void
  onLeft: () => void
}

export default function JoinLeaveEventButton(props: JoinLeaveEventButtonProps) {
  const handleError = useErrorHandler()

  const buttonText = props.joined ? 'Leave Event' : 'Join Event'

  const handleParticipateButton = async () => {
    try {
      props.onPending(true)

      if (props.joined) {
        const confirmed = window.confirm(
          'Are you sure you want to leave this event?'
        )
        if (!confirmed) {
          return
        }

        await leaveEvent(props.eventId)
        props.onLeft()
      } else {
        await joinEvent(props.eventId)
        props.onJoined()
      }
    } catch (error) {
      handleError(error)
    } finally {
      props.onPending(false)
    }
  }

  return (
    <button
      type="button"
      className={classNames(
        'mx-auto max-w-lg w-full py-3 px-4 flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-white focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-colors',
        props.joined
          ? 'bg-red-600 hover:bg-red-700 focus:bg-red-700'
          : 'bg-primary hover:bg-primary-700 focus:bg-primary-700'
      )}
      disabled={props.disabled}
      onClick={handleParticipateButton}
    >
      {buttonText}
    </button>
  )
}
