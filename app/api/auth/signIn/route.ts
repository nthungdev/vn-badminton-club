import { createErrorResponse } from '@/lib/apiResponse'
import { INTERNAL_ERROR } from '@/lib/constants/errorMessages'
import { verifySession } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')
    if (!sessionToken?.value) {
      return createErrorResponse(new Error('No session in cookie'), 401)
    }
    const results = await verifySession(sessionToken.value)
    return NextResponse.json(results, { status: results.isAuth ? 200 : 401 })
  } catch (error) {
    console.log('Error in GET /api/auth/signIn', {error})
    return createErrorResponse(new Error(INTERNAL_ERROR), 401)
  }
}
