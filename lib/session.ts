'server-only'

import { cookies } from 'next/headers'
import { auth } from './firebase/serverApp'
import { cache } from 'react'
import { DecodedIdToken } from 'firebase-admin/auth'

async function saveSession(idToken: string) {
  console.log('saveSession called')
  const decodedToken = await auth.verifyIdToken(idToken)

  if (decodedToken) {
    console.log('create session...')
    // Generate session cookie
    const expiresIn = 60 * 60 * 24 * 14 * 1000 // 14 days
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

function deleteSession() {
  cookies().delete('session')
}

interface VerifySessionResult {
  isAuth?: boolean
  decodedIdToken?: DecodedIdToken
  session?: string
}

const verifySession: () => Promise<VerifySessionResult> = cache(async () => {
  const session = cookies().get('session')?.value || ''
  try {
    const decodedIdToken = await auth.verifySessionCookie(session, true)
    if (!decodedIdToken.uid) {
      return {}
    }
    return { isAuth: true, decodedIdToken, session }
  } catch {
    return {}
  }
})

export { saveSession, deleteSession, verifySession }
export type { VerifySessionResult }