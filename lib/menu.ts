enum AuthGuard {
  AuthenticatedRequired,
  UnauthenticatedRequired,
  Public,
}

interface MenuItem {
  label: string
  href: string
  guard: AuthGuard
}

const menuHref = {
  home: '/',
  signIn: '/signIn',
  signUp: '/signUp',
}

const menu: MenuItem[] = [
  {
    label: 'Home',
    href: menuHref.home,
    guard: AuthGuard.Public,
  },
  {
    label: 'Sign In',
    href: menuHref.signIn,
    guard: AuthGuard.UnauthenticatedRequired,
  },
  {
    label: 'Sign Up',
    href: menuHref.signUp,
    guard: AuthGuard.UnauthenticatedRequired,
  },
]

export { menu, menuHref, AuthGuard }
export type { MenuItem }
