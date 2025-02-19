'use client'

import { EventParticipant } from '@/firebase/definitions/event'
import { useState } from 'react'
import { MdGroup, MdPerson } from 'react-icons/md'
import GroupedParticipantList from './GroupedParticipantList'
import OrderedParticipantList from './OrderedParticipantList'
import classNames from 'classnames'
import { Tooltip } from 'flowbite-react'

export default function ParticipantList({
  participants,
}: {
  participants: EventParticipant[]
}) {
  const [groupGuests, setGroupGuests] = useState<boolean>(false)

  const isEmpty = participants.length === 0
  const tooltipContent = groupGuests ? 'Grouped guests' : 'Ordered by join time'
  // const hasGuests = participants.some((p) => p.type === 'guest')
  const showSortButton = participants.length > 1

  const IconComponent = groupGuests ? MdGroup : MdPerson

  return (
    <div
      className={classNames(
        'relative py-2 bg-white border shadow-sm rounded-xl flex flex-col items-baseline overflow-hidden',
        showSortButton && 'min-h-36'
      )}
    >
      {isEmpty ? (
        <div className="self-stretch text-center text-gray-600 py-2">
          No one has joined this event.
        </div>
      ) : (
        <>
          {showSortButton && (
            <div className="z-10 absolute top-2 right-2">
              <Tooltip
                className="text-center bg-primary-900 text-white"
                theme={{
                  arrow: {
                    style: {
                      dark: 'bg-primary-900',
                      light: 'bg-primary-900',
                      auto: 'bg-primary-900',
                    },
                  },
                }}
                content={tooltipContent}
              >
                <button
                  className="shadow-lg rounded-md shrink grow-0 basis-0 self-end p-1 bg-white text-primary hover:bg-primary hover:text-white hover:shadow-md transition-none"
                  onClick={() => setGroupGuests(!groupGuests)}
                >
                  <IconComponent className="size-6 transition-none" />
                </button>
              </Tooltip>
            </div>
          )}

          <div className="pl-2 pr-6">
            {groupGuests && (
              <GroupedParticipantList participants={participants} />
            )}
            {!groupGuests && (
              <OrderedParticipantList participants={participants} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
