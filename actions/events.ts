'use server'

import { getMe } from './auth'
import { INTERNAL_ERROR_MESSAGE } from './constants'
import {
  CreateEventFormSchema,
  CreateEventFormState,
} from './event.definitions'
import { createEvent as _createEvent, AppEvent } from '@/lib/firebase/firestore'

async function createEvent(
  prevState: CreateEventFormState,
  formData: FormData
) {
  const fields = {
    name: formData.get('title'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    date: formData.get('date'),
    slots: formData.get('slots'),
  }
  console.log({ fields })

  // Validate form fields
  const validatedFields = CreateEventFormSchema.safeParse({
    name: formData.get('title'),
    startTime: formData.get('startTime') || null,
    endTime: formData.get('endTime') || null,
    date: formData.get('date') || null,
    slots: formData.get('slots')
      ? parseInt(formData.get('slots') as string)
      : null,
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    console.log({ error: validatedFields.error.flatten().fieldErrors })
    return {
      inputErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    // TODO get user from session or client Firebase instead of fetching
    const me = await getMe()
    if (!me) {
      throw new Error('User not found')
    }

    const event: AppEvent = {
      title: validatedFields.data.title,
      date: validatedFields.data.date,
      startTime: validatedFields.data.startTime,
      endTime: validatedFields.data.endTime,
      slots: validatedFields.data.slots,
      createdBy: me.uid,
    }

    await _createEvent(event)

    // TODO navigate to Event details page
  } catch (error) {
    // TODO handle error
    console.log({ error })
    return { submitError: INTERNAL_ERROR_MESSAGE }
  }
}

export { createEvent }
