import { Role } from '../firebase/definitions'
import { auth } from '../firebase/serverApp'

async function isRoleMod(uid: string) {
  const user = await auth.getUser(uid)
  const role: string | undefined = user.customClaims?.role
  return role === Role.Mod
}

export { isRoleMod }
