'use client'

import { ComponentProps, useState } from 'react'
import ParticipantActionButton from './ParticipantActionButton'
import {
  BUTTON_KICK,
  BUTTON_KICK_PASSED_LEAVE_CUTOFF_TOOLTIP,
} from '@/lib/constants/events'
import { Role } from '@/firebase/definitions'
import { useAuth } from '@/contexts/AuthContext'
import {
  DEFAULT_EVENT_LEAVE_CUTOFF,
  hasPassed,
  isEventParticipant,
  isFirestoreEventGuest,
} from '@/lib/utils/events'
import {
  CreatedEvent,
  EventParticipant,
  FirestoreEventGuest,
} from '@/firebase/definitions/event'
import KickParticipantModal from './KickParticipantModal'
import { kickGuest } from '@/fetch/events'
import useErrorHandler from '@/hooks/useErrorHandler'
import { GroupedParticipants } from './types'
import { Tooltip } from 'flowbite-react'

interface KickParticipantButtonProps extends ComponentProps<'button'> {
  event: CreatedEvent
  pending?: boolean
  participants: (EventParticipant | FirestoreEventGuest)[]
  onKicked: (participants: (EventParticipant | FirestoreEventGuest)[]) => void
  setPending: (pending: boolean) => void
}

export default function KickParticipantButton(
  props: KickParticipantButtonProps
) {
  const { user } = useAuth()
  const handleError = useErrorHandler()
  const [kickMode, setKickMode] = useState(false)

  const isMod = user?.role === Role.Mod
  const isOrganizer = user?.uid === props.event.organizer.uid
  const isOnlySelfParticipant =
    props.participants.length === 1 &&
    props.participants.some((p) => isEventParticipant(p) && p.uid === user!.uid)
  const hasMyGuests = props.participants.some(
    (p) => isFirestoreEventGuest(p) && p.addedBy === user!.uid
  )
  const isPastEvent = hasPassed(props.event.startTimestamp)
  const hasPassedLeaveCutoff = hasPassed(
    props.event.startTimestamp,
    DEFAULT_EVENT_LEAVE_CUTOFF
  )
  const showKickButtonTooltip = !isMod && hasPassedLeaveCutoff

  const showKickButton =
    props.participants.length > 0 &&
    !isOnlySelfParticipant &&
    (isMod || !isPastEvent) &&
    (isMod || isOrganizer || hasMyGuests)
  const disableKickButton =
    props.pending || kickMode || (!isMod && hasPassedLeaveCutoff)

  const kickableParticipants = props.participants.filter((p) => {
    if (isEventParticipant(p) && p.uid === user!.uid) {
      return false
    }

    if (isMod || isOrganizer) {
      // Mod and organizer can kick anyone
      return true
    } else {
      // Only show guests added by the current user
      return isFirestoreEventGuest(p) && p.addedBy === user!.uid
    }
  })
  const kickableParticipantsGrouped = kickableParticipants.reduce(
    (prev, curr) => {
      if (isEventParticipant(curr)) {
        return { ...prev, users: [...prev.users, curr] }
      } else if (isFirestoreEventGuest(curr)) {
        return {
          ...prev,
          userGuests: {
            ...prev.userGuests,
            [curr.addedBy]: {
              ...prev.userGuests[curr.addedBy],
              userDisplayName: curr.userDisplayName,
              guests: [...(prev.userGuests[curr.addedBy]?.guests || []), curr],
            },
          },
        }
      }
      return prev
    },
    {
      users: [],
      userGuests: {},
    } as GroupedParticipants
  )

  const handleKick = async (
    participant: EventParticipant | FirestoreEventGuest
  ) => {
    try {
      props.setPending(true)
      if (isEventParticipant(participant)) {
        await kickGuest(props.event.id, participant.uid)
        const updated = props.participants.filter((p) =>
          isEventParticipant(p) ? p.uid !== participant.uid : true
        )
        if (updated.length === 0) {
          setKickMode(false)
        }
        props.onKicked(updated)
      } else {
        await kickGuest(props.event.id, participant.guestId)
        const updated = props.participants.filter((p) =>
          isFirestoreEventGuest(p) ? p.guestId !== participant.guestId : true
        )
        if (updated.length === 0) {
          setKickMode(false)
        }
        props.onKicked(updated)
      }
    } catch (error) {
      handleError(error)
    } finally {
      props.setPending(false)
    }
  }

  function renderKickParticipantButton() {
    return (
      <ParticipantActionButton
        disabled={disableKickButton}
        onClick={() => setKickMode(!kickMode)}
      >
        {BUTTON_KICK}
      </ParticipantActionButton>
    )
  }

  return (
    <>
      {showKickButton &&
        (showKickButtonTooltip ? (
          <Tooltip content={BUTTON_KICK_PASSED_LEAVE_CUTOFF_TOOLTIP}>
            {renderKickParticipantButton()}
          </Tooltip>
        ) : (
          renderKickParticipantButton()
        ))}

      <KickParticipantModal
        show={kickMode}
        onClose={() => setKickMode(false)}
        onKick={handleKick}
        participantsGrouped={kickableParticipantsGrouped}
        disabled={props.pending}
      />
    </>
  )
}
