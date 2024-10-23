'use client'

import {
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'
import { GroupedParticipants } from './types'
import { Modal } from 'flowbite-react'
import { useAuth } from '@/contexts/AuthContext'

interface KickListProps {
  disabled?: boolean
  participants: (EventParticipant | FirestoreEventGuest)[]
  onKick: (participant: EventParticipant | FirestoreEventGuest) => void
}

function KickList(props: KickListProps) {
  return (
    <ul className="flex flex-wrap flex-row">
      {props.participants.map((participant, index) => (
        <li
          key={index}
          id="badge-dismiss-default"
          className="inline-flex items-center mr-2 my-1 px-3 py-1 font-medium text-white bg-secondary-700 rounded"
        >
          {participant.displayName}
          <button
            type="button"
            className="inline-flex items-center p-1 ms-2 text-sm text-secondary-300 bg-transparent rounded-sm hover:bg-secondary-200 hover:text-secondary-900"
            data-dismiss-target="#badge-dismiss-default"
            aria-label="Remove"
            onClick={() => props.onKick(participant)}
            disabled={props.disabled}
          >
            <svg
              className="w-2 h-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Remove badge</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function KickParticipantModal({
  show,
  participantsGrouped,
  disabled,
  onKick,
  onClose,
}: {
  show: boolean
  participantsGrouped: GroupedParticipants
  disabled?: boolean
  onClose: () => void
  onKick: (participant: EventParticipant | FirestoreEventGuest) => void
}) {
  const { user } = useAuth()

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>
        <span>Kick Participants</span>
      </Modal.Header>
      <Modal.Body className="py-2">
        <div className="divide-y-2">
          {participantsGrouped.users.length > 0 && (
            <div className="space-y-1 py-3">
              <div className="text-xl font-bold">Users</div>
              <KickList
                participants={participantsGrouped.users}
                onKick={onKick}
                disabled={disabled}
              />
            </div>
          )}

          <div className="divide-y-2">
            {Object.entries(participantsGrouped.userGuests).map(
              ([userId, guestData]) => (
                <div key={userId} className="space-y-1 py-3">
                  <div className="text-lg">
                    <span className="font-bold">
                      {userId === user!.uid
                        ? 'My'
                        : `${guestData.userDisplayName}'s`}
                    </span>{' '}
                    Guests
                  </div>
                  <KickList
                    participants={guestData.guests}
                    onKick={onKick}
                    disabled={disabled}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
