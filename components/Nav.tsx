'use client'

import { signOut } from '@/actions/auth'
import { MenuItem } from '@/lib/menu'
import { usePathname } from 'next/navigation'

interface NavProps {
  menu: MenuItem[]
  isAuthenticated: boolean
  displayName?: string
  email?: string
  role?: string
  siteName: string
}

export default function Nav(props: NavProps) {
  const { menu, isAuthenticated } = props

  const pathname = usePathname()

  return (
    <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
      <div>
        {props.siteName && (
          <a
            className="flex-none font-semibold text-xl text-white focus:outline-none focus:opacity-80"
            href="#"
            aria-label="Brand"
          >
            {props.siteName}
          </a>
        )}
      </div>

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

        {props.displayName && (
          <span className="relative text-white font-semibold ml-auto group cursor-default">
            {props.displayName}

            {props.email && (
              <div className="hidden group-hover:block absolute top-full right-0">
                <div className="mt-1 bg-primary-100 px-3 py-2 text-gray-800 rounded-md shadow-md">
                  <div className="capitalize text-right font-bold text-secondary">
                    {props.role}
                  </div>
                  <div>{props.email}</div>
                </div>
              </div>
            )}
          </span>
        )}
      </div>
    </nav>
  )
}
