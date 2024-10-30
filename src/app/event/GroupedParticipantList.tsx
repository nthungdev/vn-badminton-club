import { EventParticipant } from '@/firebase/definitions/event'
import { GroupedParticipants } from './types'
import { ComponentProps } from 'react'

export default function GroupedParticipantList({
  participants,
  className,
}: {
  participants: EventParticipant[]
  className?: ComponentProps<'div'>['className']
}) {
  const participantsGrouped: GroupedParticipants = participants.reduce(
    (prev, curr) => {
      if (curr.type === 'user') {
        return { ...prev, users: [...prev.users, curr] } as GroupedParticipants
      } else if (curr.type === 'guest') {
        return {
          ...prev,
          userGuests: {
            ...prev.userGuests,
            [curr.addedByUid]: {
              ...prev.userGuests[curr.addedByUid],
              displayName: curr.addedByDisplayName,
              guests: [
                ...(prev.userGuests[curr.addedByUid]?.guests || []),
                curr,
              ],
            },
          },
        } as GroupedParticipants
      }
      return prev
    },
    {
      users: [],
      userGuests: {},
    } as GroupedParticipants
  )

  if (participants.length === 0) return null

  return (
    <div className={className}>
      {participantsGrouped.users.length > 0 && (
        <ul className="space-y-1 flex flex-col py-2">
          {participantsGrouped.users.map((participant, index) => (
            <li key={index} className="px-3 py-1">
              <span className="font-medium text-secondary-700">
                {participant.type === 'user' ? participant.displayName : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
      {Object.entries(participantsGrouped.userGuests).map(
        ([userId, guestData]) => (
          <div key={userId} className="px-3 py-2 space-y-1">
            <div className="font-medium text-gray-600">
              {guestData.displayName}&apos;s guests
            </div>
            <ul key={userId} className="space-y-1 flex flex-col">
              {guestData.guests.map((guest, index) => (
                <li key={index}>
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
  )
}
