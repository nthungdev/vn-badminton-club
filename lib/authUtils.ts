import { UserRecord } from 'firebase-admin/auth'
import { Role } from './firebase/definitions'

function getUserRole(user: UserRecord) {
  return user.customClaims?.role as Role | undefined
}

export { getUserRole }
