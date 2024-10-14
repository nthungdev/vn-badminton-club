import { FirebaseError } from 'firebase/app'
import { auth } from './clientApp'
import { AuthErrorCodes, signInWithEmailAndPassword } from 'firebase/auth'
import { createAuthError } from './error'

async function signInWithEmailPassword(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    return userCredential
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS) {
        throw createAuthError('AUTH_INVALID_CREDENTIALS')
      }
    }
    throw new Error('Unknown Error')
  }
}

export { signInWithEmailPassword }
