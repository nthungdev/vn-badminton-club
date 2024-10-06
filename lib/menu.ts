const menuHref = {
  home: '/',
  signIn: '/signIn',
  signUp: '/signUp',
  signOut: '/signOut',
}

const menu = [
  {
    label: 'Home',
    href: menuHref.home,
  },
  {
    label: 'Sign In',
    href: menuHref.signIn,
  },
  {
    label: 'Sign Up',
    href: menuHref.signUp,
  },
  {
    label: 'Sign Out',
    href: menuHref.signOut,
  },
]



export { menu, menuHref }