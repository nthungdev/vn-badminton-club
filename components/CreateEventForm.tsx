'use client'

import { useFormState, useFormStatus } from 'react-dom'
import DateInput from './DateInput'
import TimeInput from './TimeInput'
import { createEvent } from '@/actions/events'

export default function CreateEventForm() {
  const [state, action] = useFormState(createEvent, undefined)
  const { pending } = useFormStatus()

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-center text-4xl">Create Event</h1>
      <form className="max-w-sm mx-auto space-y-6" action={action}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="bg-gray-100 border-none text-gray-900 placeholder-text-transparent text-sm rounded-lg  focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:pointer-events-none block w-full p-4"
              placeholder="Badminton Event"
            />
            {/* <p className="mt-2 text-sm text-green-600 dark:text-green-500"><span className="font-medium">Well done!</span> Some success message.</p> */}
            {state?.inputErrors?.title && <p className='text-red-600'>{state.inputErrors.title}</p>}
          </div>

          <DateInput label="Date" id="date" errorMessage={state?.inputErrors?.date} />

          <TimeInput label="Start time" id="startTime" errorMessage={state?.inputErrors?.startTime} />

          <TimeInput label="End time" id="endTime" errorMessage={state?.inputErrors?.endTime} />

          <div className="">
            <label
              htmlFor="slots"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Slots
            </label>
            <input
              type="number"
              name="slots"
              id="slots"
              aria-describedby="Number of slots"
              className="bg-gray-100 border-none text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block w-full p-4"
              placeholder="Number of slots"
              min="2"
            />
            {state?.inputErrors?.slots && <p className='text-red-600'>{state.inputErrors.slots}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="mt-3 w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-700 focus:outline-none focus:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
          disabled={pending}
        >
          Create
        </button>
        {state?.submitError && (
          <p className="text-red-600">{state.submitError}</p>
        )}
      </form>
    </div>
  )
}
