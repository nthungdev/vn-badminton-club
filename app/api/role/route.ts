import { createErrorResponse } from '@/lib/apiResponse'
import { RolePostRequest } from '@/lib/firebase/definitions'
import { AuthError } from '@/lib/firebase/error'
import { auth } from '@/lib/firebase/serverApp'
import { setUserRole } from '@/lib/firebase/utils'
import { validateAuthority } from '@/lib/utils/api'
import { NextRequest } from 'next/server'

// These routes require user with mod privileges to access them.
// To authorize, pass the user's session token as the Bearer token in the Authorization header.


export async function GET(request: NextRequest) {
  const valid = await validateAuthority(request)
  if (!valid) {
    return createErrorResponse('Unauthorized', 401)
  }

  const uid = request.nextUrl.searchParams.get('uid')

  if (!uid) {
    return createErrorResponse('Missing uid', 400)
  }

  try {
    const user = await auth.getUser(uid)
    const role: string | undefined = user.customClaims?.role
    return Response.json({ role })
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}

export async function POST(request: NextRequest) {
  const valid = validateAuthority(request)
  if (!valid) {
    return createErrorResponse('Unauthorized', 401)
  }

  const data: RolePostRequest = await request.json()

  if (!data.uid || !data.role) {
    return createErrorResponse('Missing uid or role', 400)
  }

  try {
    await setUserRole(data.uid, data.role)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('AuthError:', error)
      switch (error.name) {
        case 'ROLE_SET_ERROR':
          return createErrorResponse(error, 500)
        default:
          return createErrorResponse(error, 400)
      }
    }
    console.error('Error setting role:', error)
    return createErrorResponse(error, 500)
  }
}

export async function DELETE(request: NextRequest) {
  const valid = validateAuthority(request)
  if (!valid) {
    return createErrorResponse('Unauthorized', 401)
  }

  const uid = request.nextUrl.searchParams.get('uid')

  if (!uid) {
    return createErrorResponse('Missing uid', 400)
  }

  try {
    const user = await auth.getUser(uid)
    const customClaims = user.customClaims
    if (customClaims?.role) {
      await auth.setCustomUserClaims(uid, { ...customClaims, role: undefined })
    }
    return Response.json({ success: true })
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}
