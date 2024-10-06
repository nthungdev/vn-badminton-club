import { saveSession } from '../session'
import { auth } from './clientApp'
import { signInWithEmailAndPassword } from 'firebase/auth'

async function signInWithEmailPassword(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    const idToken = await userCredential.user.getIdToken()
    await saveSession(idToken)
  } catch (error) {
    throw error
  }
}

export { signInWithEmailPassword }