'use server'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'

import { redirect } from 'next/navigation'
import { getMe } from './auth'
import {
  CreateEventFormSchema,
  CreateEventFormState,
  EditEventFormSchema,
  EditEventFormState,
} from '@/lib/validation/events'
import {
  createEvent as _createEvent,
  getEventById as _getEventById,
} from '@/firebase/firestore'
import { menuHref } from '@/lib/menu'
import { Role } from '@/firebase/definitions'
import { CreateEvent, EditEventParams } from '@/firebase/definitions/event'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { fieldsToDate } from '@/lib/format'
import { INTERNAL_ERROR, UNAUTHORIZED_ERROR } from '@/constants/errorMessages'
import { verifySession } from '@/lib/session'
import { editEvent as _editEvent } from '@/lib/events'

dayjs.extend(utc)
dayjs.extend(timezone)

export async function createEvent(
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

export async function editEvent(
  prevState: EditEventFormState,
  formData: FormData
) {
  const { decodedIdToken, isAuth } = await verifySession()
  if (!isAuth) {
    return { submitError: UNAUTHORIZED_ERROR }
  }

  // Validate form fields
  const validatedFields = EditEventFormSchema.safeParse({
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

    const updateEvent: EditEventParams = {
      title: validatedFields.data.title,
      startTimestamp,
      endTimestamp,
      slots: validatedFields.data.slots,
    }

    await _editEvent(
      validatedFields.data.id,
      updateEvent,
      decodedIdToken.uid,
      decodedIdToken.role
    )
    redirect(`${menuHref.event}?e=${validatedFields.data.id}`)
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    // TODO handle error
    console.error('create event error', { error })
    return { submitError: INTERNAL_ERROR }
  }
}

export async function getEventById(eventId: string) {
  try {
    const event = await _getEventById(eventId)
    return event
  } catch (error) {
    // TODO format error
    console.error('Error getting new events:', error)
    throw new Error('Error getting event')
  }
}
