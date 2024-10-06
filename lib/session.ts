'server-only'

import { cookies } from 'next/headers'
import { auth } from './firebase/serverApp'

async function checkSession() {
  const session = cookies().get('session')?.value || ''

  //Validate if the cookie exist in the request
  if (!session) {
    return false
  }

  //Use Firebase Admin to validate the session cookie
  const decodedClaims = await auth.verifySessionCookie(session, true)

  console.log({ decodedClaims })

  if (!decodedClaims) {
    return false
  }

  return true
}

async function saveSession(idToken: string) {
  console.log('saveSession called')
  const decodedToken = await auth.verifyIdToken(idToken)

  if (decodedToken) {
    console.log('create session...')
    // Generate session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    })
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    }

    // Add the cookie to the browser
    cookies().set(options)
  }
}

export { checkSession, saveSession }
