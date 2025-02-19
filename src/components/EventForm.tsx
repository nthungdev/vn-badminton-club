'use client'

import { useFormState, useFormStatus } from 'react-dom'
import DateInput from './DateInput'
import TimeInput from './TimeInput'
import { createEvent, editEvent } from '@/actions/events'
import { CreatedEvent } from '@/firebase/definitions/event'
import dayjs from 'dayjs'
import LoadingSpinner from './LoadingSpinner'
import { BUTTON_CREATE, BUTTON_EDIT, FORM_CREATE_EVENT_TITLE, FORM_EDIT_EVENT_TITLE } from '@/lib/constants/events'

interface EventFormProps {
  /** if undefined, this form is in create event mode */
  event?: CreatedEvent
}

export default function EventForm(props: EventFormProps) {
  const isEditing = !!props.event
  const [state, action] = useFormState(
    isEditing ? editEvent : createEvent,
    undefined
  )

  const formHeading = isEditing ? FORM_EDIT_EVENT_TITLE : FORM_CREATE_EVENT_TITLE
  const submitButtonText = isEditing ? BUTTON_EDIT : BUTTON_CREATE

  const defaultDate = props.event
    ? dayjs(props.event.startTimestamp).format('YYYY-MM-DD')
    : ''
  const defaultStartTime = props.event
    ? dayjs(props.event.startTimestamp).format('HH:mm')
    : ''
  const defaultEndTime = props.event
    ? dayjs(props.event.endTimestamp).format('HH:mm')
    : ''


  return (
    <div className="max-w-sm space-y-4 py-4 mx-auto">
      <h1 className="text-center text-4xl">{formHeading}</h1>
      <form className="space-y-6" action={action}>
        <div className="space-y-4">
          <div className="hidden">
            <input type="text" name="id" defaultValue={props.event?.id} />
            <input
              type="text"
              name="timezoneOffset"
              defaultValue={new Date().getTimezoneOffset()}
            />
          </div>

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
              className="bg-gray-100 border-none text-gray-900 placeholder-text-transparent text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:pointer-events-none block w-full p-4"
              placeholder="Badminton Event"
              defaultValue={props.event?.title}
            />
            {state?.inputErrors?.title && (
              <p className="text-red-600">{state.inputErrors.title}</p>
            )}
          </div>

          <DateInput
            label="Date"
            id="date"
            errorMessage={state?.inputErrors?.date}
            defaultValue={defaultDate}
          />

          <TimeInput
            label="Start time"
            id="startTime"
            errorMessage={state?.inputErrors?.startTime}
            defaultValue={defaultStartTime}
          />

          <TimeInput
            label="End time"
            id="endTime"
            errorMessage={state?.inputErrors?.endTime}
            defaultValue={defaultEndTime}
          />

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
              defaultValue={props.event?.slots}
            />
            {state?.inputErrors?.slots && (
              <p className="text-red-600">{state.inputErrors.slots}</p>
            )}
          </div>
        </div>

        <SubmitButton label={submitButtonText} />
        {state?.submitError && (
          <p className="text-red-600">{state.submitError}</p>
        )}
      </form>
    </div>
  )
}

interface SubmitButtonProps {
  label: string
}

function SubmitButton(props: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className="mt-3 w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-700 focus:outline-none focus:bg-primary-700 focus:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none"
      disabled={pending}
    >
      {pending ? <LoadingSpinner sizeClasses="size-4" /> : props.label}
    </button>
  )
}
