import { getEventById } from "@/actions/events"
import { redirect } from "next/navigation"

export default async  function EventUpdatePage({
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
    return
  }

  return <div>EventUpdatePage</div>
}