'use client'

import { ComponentProps, useState } from 'react'
import { Tooltip } from 'flowbite-react'
import ParticipantActionButton from './ParticipantActionButton'
import {
  BUTTON_KICK,
  BUTTON_KICK_PASSED_LEAVE_CUTOFF_TOOLTIP,
} from '@/lib/constants/events'
import { Role } from '@/firebase/definitions'
import { useAuth } from '@/contexts/AuthContext'
import { DEFAULT_EVENT_LEAVE_CUTOFF, hasPassed } from '@/lib/utils/events'
import { CreatedEvent, EventParticipant } from '@/firebase/definitions/event'
import KickParticipantModal from './KickParticipantModal'
import { kickGuest } from '@/fetch/events'
import useErrorHandler from '@/hooks/useErrorHandler'
import { GroupedParticipants } from './types'

interface KickParticipantButtonProps extends ComponentProps<'button'> {
  event: CreatedEvent
  pending?: boolean
  participants: EventParticipant[]
  onKicked: (participants: EventParticipant[]) => void
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
    props.participants.some((p) => p.uid === user!.uid)
  const hasMyGuests = props.participants.some(
    (p) => p.type === 'guest' && p.addedByUid === user!.uid
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
    if (p.type === 'user' && p.uid === user!.uid) {
      return false
    }

    if (isMod || isOrganizer) {
      // Mod and organizer can kick anyone
      return true
    } else {
      // Only show guests added by the current user
      return p.type === 'guest' && p.addedByUid === user!.uid
    }
  })
  const kickableParticipantsGrouped = kickableParticipants.reduce(
    (prev, curr) => {
      if (curr.type === 'user') {
        return { ...prev, users: [...prev.users, curr] }
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
        }
      }
      return prev
    },
    {
      users: [],
      userGuests: {},
    } as GroupedParticipants
  )

  const handleKick = async (participant: EventParticipant) => {
    try {
      props.setPending(true)
      if (participant.type === 'user') {
        await kickGuest(props.event.id, participant.uid)
        const updated = props.participants.filter(
          (p) => p.uid !== participant.uid
        )
        if (updated.length === 0) {
          setKickMode(false)
        }
        props.onKicked(updated)
      } else if (participant.type === 'guest') {
        await kickGuest(props.event.id, participant.guestId)
        const updated = props.participants.filter(
          (p) => p.guestId !== participant.guestId
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
