'server-only'

import { NextRequest } from 'next/server'
import { verifySession } from '@/lib/session'
import { Role } from '@/firebase/definitions'

async function validateAuthority(request: NextRequest) {
  const session = request.headers.get('Authorization')?.split('Bearer ')[1]
  if (!session) {
    return false
  }

  const { decodedIdToken } = await verifySession(session)
  if (!decodedIdToken) {
    return false
  }

  const role: string = decodedIdToken.role
  if (role !== Role.Mod) {
    return false
  }

  return true
}

export { validateAuthority }
