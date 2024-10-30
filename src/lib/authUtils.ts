'server-only'

import { DecodedIdToken, UserRecord } from 'firebase-admin/auth'
import { Role } from '../firebase/definitions'
import { auth } from '../firebase/serverApp'
import { AuthContextUser } from '@/contexts/AuthContext'
import { verifySession } from './session'
import { getNodeCache } from './cache'

interface User {
  uid: string
  displayName: string
}

export function getUserRole(user: UserRecord) {
  return user.customClaims?.role as Role | undefined
}

export async function getUserById(userId: string) {
  const cache = getNodeCache('usersCache')
  const cachedUser: User | undefined = cache.get(userId)
  if (cachedUser) {
    return cachedUser
  }

  const userRecord = await auth.getUser(userId)
  if (!userRecord) {
    return null
  }

  const user = {
    uid: userRecord.uid,
    displayName: userRecord.displayName!,
  }

  cache.set(userId, user)

  return user
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
