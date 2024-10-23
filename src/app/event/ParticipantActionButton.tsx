import classNames from 'classnames'
import { ComponentProps } from 'react'

export default function ParticipantActionButton(
  props: ComponentProps<'button'>
) {
  const { children, className, ...restProps } = props

  return (
    <button
      {...restProps}
      className={classNames(
        'py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-colors text-secondary-700 hover:text-white hover:bg-secondary-700 focus:ring',
        className
      )}
    >
      {children}
    </button>
  )
}
