'server-only'

import { cookies, headers } from 'next/headers'
import { auth } from '../firebase/serverApp'
import { DecodedIdToken } from 'firebase-admin/auth'
import { Role } from '@/firebase/definitions'

export async function saveSession(idToken: string) {
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

export function deleteSession() {
  cookies().delete('session')
}

interface VerifySessionResult {
  isAuth?: boolean
  decodedIdToken?: DecodedIdToken
  session?: string
}

export interface AppDecodedIdToken extends DecodedIdToken {
  email: string
  name: string
  role: Role
}

export const verifySession = async (session?: string) => {
  const _session = session || cookies().get('session')?.value || headers().get('Authorization')?.split('Bearer ')?.[1] || ''
  try {
    const decodedIdToken = await auth.verifySessionCookie(_session, true) as AppDecodedIdToken
    if (!decodedIdToken.uid) {
      return {}
    }
    return { isAuth: true, decodedIdToken, session: _session }
  } catch {
    return {}
  }
}

export type { VerifySessionResult }
