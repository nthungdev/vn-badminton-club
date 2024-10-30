import { EventParticipant } from '@/firebase/definitions/event'
import classNames from 'classnames'
import { ComponentProps } from 'react'

export default function OrderedParticipantList({
  participants,
  className,
}: {
  participants: EventParticipant[]
  className?: ComponentProps<'div'>['className']
}) {
  if (participants.length === 0) return null

  return (
    <ul className={classNames('space-y-1 flex flex-col py-2', className)}>
      {participants.map((participant, index) => (
        <li key={index} className="px-3 py-1">
          <span className="font-medium text-secondary-700">
            {participant.displayName}
          </span>
        </li>
      ))}
    </ul>
  )
}
