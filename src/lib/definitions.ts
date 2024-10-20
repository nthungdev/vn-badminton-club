import { z } from 'zod'

const email = z
  .string()
  .email({ message: 'Please enter a valid email.' })
  .trim()
const password = z
  .string()
  .min(8, { message: 'Be at least 8 characters long' })
  .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
  .regex(/[0-9]/, { message: 'Contain at least one number.' })
  .regex(/[^a-zA-Z0-9]/, {
    message: 'Contain at least one special character.',
  })
  .trim()

export const SignUpFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  email,
  password,
})

export type SignUpFormState =
  | {
      inputErrors?: {
        name?: string[]
        email?: string[]
        password?: string[]
      }
      signUpError?: string
    }
  | undefined

export const SignInFormSchema = z.object({
  email,
  password,
})

export type SignInFormState =
  | {
      inputErrors?: {
        email?: string[]
        password?: string[]
      }
      signInError?: string
    }
  | undefined
