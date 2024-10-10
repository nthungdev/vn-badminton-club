'server-only'

import { cookies } from 'next/headers'
import { auth } from './firebase/serverApp'
import { cache } from 'react'
import { DecodedIdToken } from 'firebase-admin/auth'

async function saveSession(idToken: string) {
  const decodedToken = await auth.verifyIdToken(idToken)

  if (decodedToken) {
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
      secure: process.env.NODE_ENV !== 'development',
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

const verifySession: (session?: string) => Promise<VerifySessionResult> = cache(
  async (session?: string) => {
    const _session = session || cookies().get('session')?.value || ''
    try {
      const decodedIdToken = await auth.verifySessionCookie(_session, true)
      if (!decodedIdToken.uid) {
        return {}
      }
      return { isAuth: true, decodedIdToken, session: _session }
    } catch {
      return {}
    }
  }
)

export { saveSession, deleteSession, verifySession }
export type { VerifySessionResult }
