'use server'

import { SignInFormSchema, SignInFormState, SignUpFormSchema, SignUpFormState } from '@/lib/definitions'
import { auth } from '@/firebase/serverApp'
import { menuHref } from '@/lib/menu'
import { saveSession, verifySession } from '@/lib/session'
import { FirebaseAuthError } from 'firebase-admin/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { setUserRole } from '@/firebase/utils'
import { Role } from '@/firebase/definitions'
import { cache } from 'react'
import { INTERNAL_ERROR } from '@/constants/errorMessages'
import { signInWithEmailPassword } from '@/firebase/auth'

export async function signUp(prevState: SignUpFormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignUpFormSchema.safeParse({
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
    const user = await auth.createUser({
      displayName: validatedFields.data.name,
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    })
    await setUserRole(user.uid, Role.Member)
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      if (error.code === 'auth/email-already-exists') {
        return { signUpError: error.message }
      }
    } else {
      console.error('Unknown Error:', error)
    }
    return { signUpError: INTERNAL_ERROR }
  }

  redirect(menuHref.signIn)
}

export async function signIn(prevState: SignInFormState, formData: FormData) {
  const validatedFields = SignInFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      inputErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const userCredential = await signInWithEmailPassword(
      validatedFields.data.email,
      validatedFields.data.password
    )
    const idToken = await userCredential.user.getIdToken()
    await saveSession(idToken)
  } catch (error) {
    if (error instanceof Error) {
      return { signInError: error.message }
    }
    console.log({ error })
    return { signInError: INTERNAL_ERROR }
  }

  redirect(menuHref.home)
}

export async function signOut() {
  cookies().delete('session')
  redirect(menuHref.signIn)
}

const getUser = cache(async (uid: string) => {
  const user = await auth.getUser(uid)
  return user
})

export async function getMe() {
  const { decodedIdToken } = await verifySession()
  if (!decodedIdToken?.uid) return null

  const user = await getUser(decodedIdToken.uid)
  return user
}
