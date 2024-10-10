enum AuthGuard {
  AuthenticatedRequired,
  UnauthenticatedRequired,
  Public,
}

interface MenuItem {
  label: string
  href: string
  guard: AuthGuard
  hideFromMenu: boolean
}

const menuHref = {
  home: '/',
  signIn: '/signIn',
  signUp: '/signUp',
  event: '/event',
  createEvent: '/event/create',
  updateEvent: '/event/update',
}

const menu: MenuItem[] = [
  {
    label: 'Home',
    href: menuHref.home,
    guard: AuthGuard.Public,
    hideFromMenu: false,
  },
  {
    label: 'Sign In',
    href: menuHref.signIn,
    guard: AuthGuard.UnauthenticatedRequired,
    hideFromMenu: false,
  },
  {
    label: 'Sign Up',
    href: menuHref.signUp,
    guard: AuthGuard.UnauthenticatedRequired,
    hideFromMenu: false,
  },
  {
    label: 'Event',
    href: menuHref.event,
    guard: AuthGuard.AuthenticatedRequired,
    hideFromMenu: true,
  },
  {
    label: 'Create Event',
    href: menuHref.createEvent,
    guard: AuthGuard.AuthenticatedRequired,
    hideFromMenu: true,
  },
  {
    label: 'Update Event',
    href: menuHref.updateEvent,
    guard: AuthGuard.AuthenticatedRequired,
    hideFromMenu: true,
  }
]

export { menu, menuHref, AuthGuard }
export type { MenuItem }
