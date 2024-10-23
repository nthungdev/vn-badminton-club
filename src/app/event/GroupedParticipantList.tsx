import { isFirestoreEventGuest } from '@/lib/utils/events'
import { GroupedParticipants } from './types'

export default function GroupedParticipantList({
  participantsGrouped,
}: {
  participantsGrouped: GroupedParticipants
}) {
  const isEmpty =
    participantsGrouped.users.length === 0 &&
    Object.values(participantsGrouped.userGuests).flat().length === 0

  return (
    <div>
      {isEmpty && (
        <div className="text-center text-gray-600 py-2">
          No one has joined this event.
        </div>
      )}
      {participantsGrouped.users.length > 0 && (
        <ul className="space-y-1 flex flex-col py-2">
          {participantsGrouped.users.map((participant, index) => (
            <li key={index} className="px-3 py-1">
              <span className="font-medium text-secondary-700">
                {participant.displayName}
              </span>
              {isFirestoreEventGuest(participant) && (
                <span className="text-gray-600">
                  <br />
                  {`(${participant.userDisplayName}'s guest)`}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {Object.entries(participantsGrouped.userGuests).map(
        ([userId, guestData]) => (
          <div key={userId} className="px-3 py-2 space-y-1">
            <div className="font-medium text-gray-600">
              {guestData.userDisplayName}&apos;s guests
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
