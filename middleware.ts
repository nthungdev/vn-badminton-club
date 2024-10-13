import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { VerifySessionResult } from './lib/session'
import { AuthGuard, menu } from './lib/menu'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')

  // Call the authentication endpoint
  // Cannot use verifySession here because middleware is using Edge runtime
  const responseAPI = await fetch(`${request.nextUrl.origin}/api/signIn`, {
    headers: {
      Cookie: `session=${session?.value}`,
    },
  })

  const { isAuth }: VerifySessionResult = await responseAPI.json()

  const menuItem = menu.find((item) => item.href === request.nextUrl.pathname)
  if (!menuItem) {
    // Invalid route, let NextJS route to 404
    return NextResponse.next()
  }

  switch (menuItem.guard) {
    case AuthGuard.AuthenticatedRequired:
      if (!isAuth) {
        return NextResponse.redirect(new URL('/signIn', request.url))
      }
      break
    case AuthGuard.UnauthenticatedRequired:
      if (isAuth) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      break
    case AuthGuard.Public:
      return NextResponse.next()
    default:
      return NextResponse.next()
  }
}

// Add your protected routes
// export const config = {
//   matcher: ['/:path*'],
// }

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
