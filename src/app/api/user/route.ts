import { createErrorResponse, createSuccessResponse } from '@/lib/apiResponse'
import { AuthError } from '@/firebase/error'
import { auth } from '@/firebase/serverApp'
import { validateAuthority } from '@/lib/utils/api'
import { NextRequest } from 'next/server'

// These routes require user with mod privileges to access them.
// To authorize, pass the user's session token as the Bearer token in the Authorization header.

export interface UserPatchRequest {
  uid?: string
  displayName?: string
}

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
    return createSuccessResponse({ user: user.toJSON() })
  } catch (error) {
    return createErrorResponse(error, 500)
  }
}

export async function PATCH(request: NextRequest) {
  const valid = validateAuthority(request)
  if (!valid) {
    return createErrorResponse('Unauthorized', 401)
  }

  const data: UserPatchRequest = await request.json()

  if (!data.uid || !data.displayName) {
    return createErrorResponse('Missing uid or displayName', 400)
  }

  try {
    await auth.updateUser(data.uid, {
      displayName: data.displayName,
    })
    return createSuccessResponse()
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
