import BasePage from '@/components/BasePage'
import EventList from '@/components/EventList'
import { getAuthUser } from '@/lib/authUtils'
import Link from 'next/link'

export default async function PageHome() {
  const authUser = await getAuthUser()
  const isAuth = !!authUser

  return (
    <BasePage>
      <h1 className="sr-only">Home</h1>

      <div className="space-y-4">
        <div className="flex flex-col items-center">
          {isAuth && (
            <Link
              href="/event/create"
              className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-700 focus:outline-none focus:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14m-7 7V5"
                  />
                </svg>
              </span>
              <span>Create Event</span>
            </Link>
          )}
        </div>

        <div className="max-w-md mx-auto px-4 overflow-hidden">
          <EventList />
        </div>
      </div>
    </BasePage>
  )
}
