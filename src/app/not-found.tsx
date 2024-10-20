import BasePage from '@/src/components/BasePage'
import Link from 'next/link'

const headerScreenReader = `Page Not Found`
const headerToDisplay = `Oops!`
const bodyText = `We couldn't find the page you were looking for`

export default function NotFound() {
  return (
    <BasePage className="h-full flex-1 flex flex-col justify-center items-center">
      <div className='text-center'>
        <h1 className="sr-only">{headerScreenReader}</h1>
        <p className="text-4xl font-bold">{headerToDisplay}</p>
        <p className="mt-4">{bodyText}</p>

        <div className="mt-10 flex flex-row justify-center">
          <Link
            href="/"
            className="inline-block text-white bg-secondary hover:bg-secondary-800 focus:ring-4 focus:ring-secondary-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Go Home
          </Link>
        </div>
      </div>
    </BasePage>
  )
}
