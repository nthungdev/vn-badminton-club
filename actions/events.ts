'use server'

import { redirect } from 'next/navigation'
import { getMe } from './auth'
import { INTERNAL_ERROR_MESSAGE } from './constants'
import {
  CreateEventFormSchema,
  CreateEventFormState,
} from './event.definitions'
import { createEvent as _createEvent, AppEvent } from '@/lib/firebase/firestore'
import { menuHref } from '@/lib/menu'

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
    title: formData.get('title'),
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

  let eventId

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

    eventId = await _createEvent(event)
  } catch (error) {
    // TODO handle error
    console.log('create event error', { error })
    return { submitError: INTERNAL_ERROR_MESSAGE }
  }

  if (eventId) {
    redirect(`${menuHref.event}/${eventId}`)
  } else {
    console.error('eventId not found')
    redirect(menuHref.home)
  }
}

export { createEvent }
