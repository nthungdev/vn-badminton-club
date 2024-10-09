'server-only'

import { UserRecord } from 'firebase-admin/auth'
import { Role } from './firebase/definitions'
import { auth } from './firebase/serverApp'

function getUserRole(user: UserRecord) {
  return user.customClaims?.role as Role | undefined
}

async function getUserById(userId: string) {
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

export { getUserRole, getUserById }
