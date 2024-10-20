import { getMe } from '@/src/actions/auth'
import { getEventById } from '@/src/actions/events'
import BasePage from '@/src/components/BasePage'
import EventForm from '@/src/components/EventForm'
import { getUserRole } from '@/src/lib/authUtils'
import { Role } from '@/src/firebase/definitions'
import { menuHref } from '@/src/lib/menu'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EventUpdatePage({
  searchParams: { e },
}: {
  searchParams: { e?: string }
}) {
  const eventId = e
  if (!eventId) {
    throw new Error('Invalid event ID')
  }

  const event = await getEventById(eventId)
  if (!event) {
    redirect('/404')
  }

  const me = await getMe()
  if (!me) {
    throw new Error('Cannot find user')
  }

  if (getUserRole(me) !== Role.Mod && me.uid !== event.organizer.uid) {
    throw new Error('Unauthorized access')
  }

  return (
    <BasePage>
      <div className="mx-auto max-w-sm">
        <Link
          className="font-medium text-primary-600 hover:underline"
          href={`${menuHref.event}?e=${event.id}`}
        >
          Back to Event Details
        </Link>
      </div>
      <EventForm event={event} />
    </BasePage>
  )
}
