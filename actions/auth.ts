'use server'

import { SignupFormSchema, SignUpFormState } from '@/app/lib/definitions'
import { auth } from '@/app/lib/firebase/serverApp'
import { menuHref } from '@/app/lib/menu'
import { FirebaseAuthError } from 'firebase-admin/auth'
import { redirect } from 'next/navigation'

const INTERNAL_ERROR_MESSAGE =
  'An internal error occurred. Please try again later.'

async function signUp(prevState: SignUpFormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      inputErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Create Firebase user
  try {
    await auth.createUser({
      displayName: validatedFields.data.name,
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    })
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      if (error.code === 'auth/email-already-exists') {
        return { signUpError: error.message }
      }
    } else {
      console.error('Unknown Error:', error)
    }
    return { signUpError: INTERNAL_ERROR_MESSAGE }
  }

  redirect(menuHref.signIn)
}

export { signUp }
