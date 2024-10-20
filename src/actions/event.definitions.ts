import { fieldsToDate, fieldsToDayjs } from '@/src/lib/format'
import dayjs from 'dayjs'
import { z } from 'zod'

export const CreateEventFormSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required.' })
      .min(1, { message: 'Title is required.' })
      .trim(),
    date: z
      .string({
        required_error: 'Date is required.',
        invalid_type_error: 'Date is required.',
      })
      .regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}/),
    startTime: z
      .string({
        required_error: 'Start time is required.',
        invalid_type_error: 'Start time is required.',
      })
      .regex(/[0-9]{2}:[0-9]{2}/),
    endTime: z
      .string({
        required_error: 'End time is required.',
        invalid_type_error: 'End time is required.',
      })
      .regex(/[0-9]{2}:[0-9]{2}/),
    slots: z
      .number({
        required_error: 'Slots is required.',
        invalid_type_error: 'Slots is required.',
      })
      .int()
      .min(2, { message: 'Minimum 2 slots required.' }),
    timezoneOffset: z.number().int(),
  })
  .refine(
    (data) => {
      // make sure date is from today onwards
      const now = new Date().setHours(0, 0, 0, 0)
      const date = fieldsToDate(
        data.date,
        '00:00',
        data.timezoneOffset
      ).setSeconds(1)
      return date > now
    },
    {
      message: 'Date must be in the future.',
      path: ['date'],
    }
  )
  .refine(
    (data) => {
      const now = new Date()
      const nowDayjs = dayjs().utcOffset(-data.timezoneOffset / 60)
      const startTimestamp = fieldsToDate(
        data.date,
        data.startTime,
        data.timezoneOffset
      )
      const startDayjs = fieldsToDayjs(
        data.date,
        data.startTime,
        data.timezoneOffset
      )

      // skip this refine if date is not today
      if (
        startDayjs.format().split('T')[0] !== nowDayjs.format().split('T')[0]
      ) {
        return true
      }

      // make sure start time is in the future
      return startTimestamp > now
    },
    {
      message: 'Start time must be in the future.',
      path: ['startTime'],
    }
  )
  .refine(
    (data) => {
      const [startHour, startMinute] = data.startTime.split(':').map(Number)
      const [endHour, endMinute] = data.endTime.split(':').map(Number)
      // assume same day
      // make sure end time is after start time
      return (
        startHour < endHour ||
        (endHour === startHour && startMinute <= endMinute)
      )
    },
    {
      message: 'End time must be after start time.',
      path: ['endTime'],
    }
  )

export const UpdateEventFormSchema = CreateEventFormSchema.and(
  z.object({ id: z.string() })
)

export type CreateEventFormState =
  | {
      inputErrors?: {
        title?: string[]
        date?: string[]
        startTime?: string[]
        endTime?: string[]
        slots?: string[]
      }
      submitError?: string
      message?: string
    }
  | undefined

export type UpdateEventFormState = CreateEventFormState
