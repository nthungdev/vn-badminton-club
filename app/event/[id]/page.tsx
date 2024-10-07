// Netlify cannot ignore deploying upon new posts to support incremental static regeneration

import BasePage from '@/components/BasePage'

export default async function Page({
  params: { id },
}: {
  params: { id: string }
}) {
  // TODO get event by id

  // TODO redirect to 404 if event not found

  return <BasePage>Event {id}</BasePage>
}
