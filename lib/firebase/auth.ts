import { FirebaseError } from 'firebase/app'
import { auth } from './clientApp'
import { AuthErrorCodes, signInWithEmailAndPassword } from 'firebase/auth'
import { createAuthError } from './error'
import { setCookie } from 'cookies-next'

async function signInWithEmailPassword(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    const idToken = await userCredential.user.getIdToken()
    setCookie('session', idToken, {
      // TODO verify this works
      httpOnly: process.env.NODE_ENV !== 'development',
      secure: process.env.NODE_ENV !== 'development',
    })
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
