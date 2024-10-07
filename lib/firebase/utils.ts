'server-only'

import { auth } from './serverApp'
import { createAuthError } from './error'
import { Role } from './definitions'

async function setUserRole(uid: string, role: string) {
  if (!(Object.values(Role) as string[]).includes(role)) {
    throw createAuthError('ROLE_INVALID')
  }

  try {
    const user = await auth.getUser(uid)
    const newClaims = {
      ...user.customClaims,
      role
    }
    await auth.setCustomUserClaims(uid, newClaims)
  } catch (error) {
    console.log('Error setting role:', error)
    throw createAuthError('ROLE_SET_ERROR', error)
  }
}

export { setUserRole }
