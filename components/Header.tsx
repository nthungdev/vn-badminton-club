import { getMe } from '@/actions/auth'
import { AuthGuard, menu } from '@/lib/menu'
import Nav from './Nav'
import { getUserRole } from '@/lib/authUtils'

export default async function Header() {
  const me = await getMe()
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

  const role = me ? getUserRole(me) : undefined

  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-outer-space-600 text-sm py-3">
      <Nav
        isAuthenticated={isAuthenticated}
        menu={filteredMenu}
        displayName={me?.displayName}
        email={me?.email}
        role={role}
      />
    </header>
  )
}
