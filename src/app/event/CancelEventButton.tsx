import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import useErrorHandler from '@/hooks/useErrorHandler'
import AppError from '@/lib/AppError'
import { menuHref } from '@/lib/menu'

interface CancelEventButtonProps extends ComponentProps<'button'> {
  eventId: string
  onPending: (pending: boolean) => void
}

export default function CancelEventButton(props: CancelEventButtonProps) {
  const { onPending, eventId, ...restProps } = props
  const router = useRouter()
  const handleError = useErrorHandler()

  const handleCancelEvent = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this event?'
    )
    if (!confirmed) {
      return
    }

    try {
      onPending(true)
      const { success } = await fetch(`/api/events/${eventId}`, {
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

  return (
    <button
      {...restProps}
      type="button"
      className={classNames(
        'w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border text-red-700 focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-white hover:text-white focus:text-white hover:bg-red-700 focus:bg-red-700 transition-colors'
      )}
      onClick={handleCancelEvent}
    >
      Cancel Event
    </button>
  )
}
