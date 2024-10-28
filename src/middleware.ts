import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { VerifySessionResult } from './lib/session'
import { AuthGuard, menu, menuHref } from './lib/menu'

export async function middleware(request: NextRequest) {
  const menuItem = menu.find((item) => item.href === request.nextUrl.pathname)
  if (!menuItem) {
    // Invalid route, let NextJS route to 404
    return NextResponse.next()
  }

  if (menuItem.guard === AuthGuard.Public) {
    return NextResponse.next()
  }

  const session = request.cookies.get('session')

  // Call the authentication endpoint
  // Cannot use verifySession here because middleware is using Edge runtime
  const responseAPI = await fetch(`${request.nextUrl.origin}/api/auth/signIn`, {
    headers: {
      Cookie: `session=${session?.value}`,
    },
  })

  const { isAuth }: VerifySessionResult = await responseAPI.json()

  switch (menuItem.guard) {
    case AuthGuard.AuthenticatedRequired:
      if (!isAuth) {
        return NextResponse.redirect(new URL(menuHref.signIn, request.url))
      }
      break
    case AuthGuard.UnauthenticatedRequired:
      if (isAuth) {
        return NextResponse.redirect(new URL(menuHref.home, request.url))
      }
      break
  }
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon\\.ico$).*)'],
}
