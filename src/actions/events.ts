'use server'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'

import { redirect } from 'next/navigation'
import { getMe } from './auth'
import {
  CreateEventFormSchema,
  CreateEventFormState,
  UpdateEventFormSchema,
  UpdateEventFormState,
} from './event.definitions'
import {
  createEvent as _createEvent,
  updateEvent as _updateEvent,
  getEventById as _getEventById,
} from '@/src/firebase/firestore'
import { menuHref } from '@/src/lib/menu'
import { Role } from '@/src/firebase/definitions'
import { CreateEvent, UpdateEvent } from '@/src/firebase/definitions/event'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { fieldsToDate } from '@/src/lib/format'
import { INTERNAL_ERROR } from '@/src/constants/errorMessages'

dayjs.extend(utc)
dayjs.extend(timezone)

async function createEvent(
  prevState: CreateEventFormState,
  formData: FormData
) {
  // Validate form fields
  const validatedFields = CreateEventFormSchema.safeParse({
    timezoneOffset: formData.get('timezoneOffset')
      ? parseInt(formData.get('timezoneOffset') as string)
      : null,
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

    const startTimestamp = fieldsToDate(
      validatedFields.data.date,
      validatedFields.data.startTime,
      validatedFields.data.timezoneOffset
    )
    const endTimestamp = fieldsToDate(
      validatedFields.data.date,
      validatedFields.data.endTime,
      validatedFields.data.timezoneOffset
    )

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
    return { submitError: INTERNAL_ERROR }
  }
}

async function updateEvent(
  prevState: UpdateEventFormState,
  formData: FormData
) {
  // Validate form fields
  const validatedFields = UpdateEventFormSchema.safeParse({
    id: formData.get('id'),
    timezoneOffset: formData.get('timezoneOffset')
      ? parseInt(formData.get('timezoneOffset') as string)
      : null,
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

    const offsetHours = validatedFields.data.timezoneOffset / 60

    const [startYear, startMonth, startDate] =
      validatedFields.data.date.split('-')
    const [startHour, startMinute] = validatedFields.data.startTime.split(':')
    const eventStart = dayjs()
      .utcOffset(-offsetHours)
      .set('year', parseInt(startYear))
      .set('month', parseInt(startMonth) - 1)
      .set('date', parseInt(startDate))
      .set('hour', parseInt(startHour))
      .set('minute', parseInt(startMinute))
      .set('second', 0)
    const startTimestamp = eventStart.toDate()

    const [endYear, endMonth, endDate] = validatedFields.data.date.split('-')
    const [endHour, endMinute] = validatedFields.data.endTime.split(':')
    const eventEnd = dayjs()
      .utcOffset(-offsetHours)
      .set('year', parseInt(endYear))
      .set('month', parseInt(endMonth) - 1)
      .set('date', parseInt(endDate))
      .set('hour', parseInt(endHour))
      .set('minute', parseInt(endMinute))
      .set('second', 0)
    const endTimestamp = eventEnd.toDate()

    const event: UpdateEvent = {
      title: validatedFields.data.title,
      startTimestamp,
      endTimestamp,
      slots: validatedFields.data.slots,
    }

    await _updateEvent(validatedFields.data.id, event)
    redirect(`${menuHref.event}?e=${validatedFields.data.id}`)
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    // TODO handle error
    console.log('create event error', { error })
    return { submitError: INTERNAL_ERROR }
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

export { createEvent, updateEvent, getEventById }
