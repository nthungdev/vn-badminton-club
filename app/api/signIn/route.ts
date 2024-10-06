import { verifySession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const results = await verifySession()
    return NextResponse.json(results, { status: results.isAuth ? 200 : 401 })
  } catch {
    return NextResponse.json({ isAuth: false }, { status: 401 })
  }
}
