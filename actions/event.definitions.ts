import { z } from 'zod'

export const CreateEventFormSchema = z.object({
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
})

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
    }
  | undefined

export type UpdateEventFormState = CreateEventFormState
