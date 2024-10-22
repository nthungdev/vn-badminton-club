import classNames from 'classnames'
import { MouseEventHandler } from 'react'

interface JoinLeaveEventButtonProps {
  joined: boolean
  disabled?: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
}

export default function JoinLeaveEventButton(props: JoinLeaveEventButtonProps) {
  const buttonText = props.joined ? 'Leave Event' : 'Join Event'

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
      onClick={props.onClick}
    >
      {buttonText}
    </button>
  )
}
