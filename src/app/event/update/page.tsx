import { getEventById } from '@/actions/events'
import BasePage from '@/components/BasePage'
import EventForm from '@/components/EventForm'
import { getAuthUser } from '@/lib/authUtils'
import { Role } from '@/firebase/definitions'
import { menuHref } from '@/lib/menu'
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

  const me = await getAuthUser()
  if (!me) {
    throw new Error('Cannot find user')
  }

  if (me.role !== Role.Mod && me.uid !== event.organizer.uid) {
    throw new Error('Unauthorized access')
  }

  return (
    <BasePage>
      <div className="mx-auto max-w-sm px-4">
        <Link
          className="font-medium text-primary-600 hover:underline"
          href={`${menuHref.event}?e=${event.id}`}
        >
          Go to Event Details
        </Link>
        <EventForm event={event} />
      </div>
    </BasePage>
  )
}
