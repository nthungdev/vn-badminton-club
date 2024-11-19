import { AuthGuard, menu } from '@/lib/menu'
import Nav from './Nav'
import { getAuthUser } from '@/lib/authUtils'

export default async function Header() {
  const me = await getAuthUser()
  const isAuthenticated = !!me

  const filteredMenu = menu
    .filter((m) => {
      switch (m.guard) {
        case AuthGuard.AuthenticatedRequired:
          return isAuthenticated
        case AuthGuard.UnauthenticatedRequired:
          return !isAuthenticated
        default:
          return true
      }
    })
    .filter((m) => !m.hideFromMenu)

  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-outer-space-600 text-sm">
      <Nav
        siteName={process.env.SITE_TITLE || ''}
        isAuthenticated={isAuthenticated}
        menu={filteredMenu}
        displayName={me?.displayName}
        email={me?.email}
        role={me?.role}
      />
    </header>
  )
}
