'server-only'

import { DecodedIdToken, UserRecord } from 'firebase-admin/auth'
import { Role } from '../firebase/definitions'
import { auth } from '../firebase/serverApp'
import { AuthContextUser } from '@/contexts/AuthContext'
import { verifySession } from './session'

export function getUserRole(user: UserRecord) {
  return user.customClaims?.role as Role | undefined
}

export async function getUserById(userId: string) {
  // TODO Fetch user from Auth
  const user = await auth.getUser(userId)
  if (!user) {
    return null
  }

  return {
    uid: user.uid,
    displayName: user.displayName,
  }
}

export function toAuthUser(decodedIdToken: DecodedIdToken): AuthContextUser {
  return {
    ...decodedIdToken,
    uid: decodedIdToken.uid,
    email: decodedIdToken.email!,
    displayName: decodedIdToken.name,
    emailVerified: decodedIdToken.email_verified ?? false,
    role: decodedIdToken?.role,
  }
}

export async function getAuthUser() {
  const { decodedIdToken } = await verifySession()
  return decodedIdToken ? toAuthUser(decodedIdToken) : null
}
