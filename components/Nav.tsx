'use client'

import { signOut } from '@/actions/auth'
import { MenuItem } from '@/lib/menu'
import { usePathname } from 'next/navigation'

interface NavProps {
  menu: MenuItem[]
  isAuthenticated: boolean
}

export default function Nav(props: NavProps) {
  const { menu, isAuthenticated } = props

  const pathname = usePathname()

  return (
    <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
      <a
        className="flex-none font-semibold text-xl text-white focus:outline-none focus:opacity-80"
        href="#"
        aria-label="Brand"
      >
        Apple Badminton
      </a>

      <div className="flex flex-row items-center gap-5 mt-5 sm:justify-end sm:mt-0 sm:ps-5">
        {menu.map((m, index) => (
          <a
            key={index}
            className="font-medium text-white focus:outline-none"
            href={m.href}
            aria-current={pathname === m.href ? 'page' : false}
          >
            {m.label}
          </a>
        ))}

        {isAuthenticated && (
          <a
            className="font-medium text-white focus:outline-none"
            href="#"
            onClick={() => signOut()}
          >
            Sign Out
          </a>
        )}
      </div>
    </nav>
  )
}
