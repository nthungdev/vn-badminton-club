'use server'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'

import { redirect } from 'next/navigation'
import { getMe } from './auth'
import { INTERNAL_ERROR_MESSAGE } from './constants'
import {
  CreateEventFormSchema,
  CreateEventFormState,
} from './event.definitions'
import {
  createEvent as _createEvent,
  getNewEvents as _getNewEvents,
  getPastEvents as _getPastEvents,
  getEventById as _getEventById,
} from '@/lib/firebase/firestore'
import { menuHref } from '@/lib/menu'
import { Role } from '@/lib/firebase/definitions'
import { CreateEvent } from '@/lib/firebase/definitions/event'
import { isRedirectError } from 'next/dist/client/components/redirect'

dayjs.extend(utc)
dayjs.extend(timezone)

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

  try {
    // TODO get user from session or client Firebase instead of fetching
    const me = await getMe()
    if (!me) {
      throw new Error('User not found')
    }

    const byMod = me.customClaims?.role === Role.Mod

    const [startHour, startMinute] = validatedFields.data.startTime.split(':')
    const eventStart = dayjs(validatedFields.data.date, 'YYYY-MM-DD')
      .startOf('date')
      .set('hour', parseInt(startHour))
      .set('minute', parseInt(startMinute))
      .utc()
    const startTimestamp = eventStart.toDate()

    const [endHour, endMinute] = validatedFields.data.endTime.split(':')
    const eventEnd = dayjs(validatedFields.data.date, 'YYYY-MM-DD')
      .startOf('date')
      .set('hour', parseInt(endHour))
      .set('minute', parseInt(endMinute))
      .utc()
    const endTimestamp = eventEnd.toDate()

    const event: CreateEvent = {
      title: validatedFields.data.title,
      startTimestamp,
      endTimestamp,
      slots: validatedFields.data.slots,
      createdBy: me.uid,
      byMod,
    }

    const eventId = await _createEvent(event)
    redirect(`${menuHref.event}?e=${eventId}`)
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    // TODO handle error
    console.log('create event error', { error })
    return { submitError: INTERNAL_ERROR_MESSAGE }
  }
}

async function getNewEvents() {
  try {
    const events = await _getNewEvents()
    return events
  } catch (error) {
    // TODO format error
    console.error('Error getting new events:', error)
    throw new Error('Error getting new events')
  }
}

async function getPastEvents() {
  try {
    const events = await _getPastEvents()
    return events
  } catch (error) {
    // TODO format error
    console.error('Error getting new events:', error)
    throw new Error('Error getting new events')
  }
}

async function getEventById(eventId: string) {
  try {
    const event = await _getEventById(eventId)
    return event
  } catch (error) {
    // TODO format error
    console.error('Error getting new events:', error)
    throw new Error('Error getting event')
  }
}

export { createEvent, getNewEvents, getPastEvents, getEventById }
