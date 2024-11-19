'use client'

import { signOut } from '@/actions/auth'
import { menuHref, MenuItem } from '@/lib/menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip } from 'flowbite-react'

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
    <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between py-1">
      <div>
        {props.siteName && (
          <Link
            className="flex-none font-semibold text-xl text-white focus:outline-none focus:opacity-80 py-2"
            href={menuHref.home}
            aria-label="Brand"
          >
            {props.siteName}
          </Link>
        )}
      </div>

      <div className="flex flex-row items-center gap-5 mt-5 sm:justify-end sm:mt-0 sm:ps-5">
        {menu.map((m, index) => (
          <a
            key={index}
            className="font-medium text-white focus:outline-none py-2 "
            href={m.href}
            aria-current={pathname === m.href ? 'page' : false}
          >
            {m.label}
          </a>
        ))}

        {isAuthenticated && (
          <a
            className="font-medium text-white focus:outline-none py-2"
            href="#"
            onClick={() => signOut()}
          >
            Sign Out
          </a>
        )}

        {props.displayName && (
          <Tooltip
            className="bg-primary-100 text-gray-800"
            theme={{
              arrow: { style: { dark: 'bg-primary-100', light: 'bg-primary-100', auto: 'bg-primary-100' } },
            }}
            content={
              <UserTooltipContent
                email={props.email || ''}
                role={props.role || ''}
              />
            }
          >
            <div
              data-tooltip-target="user-tooltip"
              className="hover:cursor-pointer text-white font-semibold ml-auto"
            >
              {props.displayName}
            </div>
          </Tooltip>
        )}
      </div>
    </nav>
  )
}

function UserTooltipContent({ role, email }: { role: string; email: string }) {
  return (
    <div>
      <div className="capitalize text-right font-bold text-secondary">
        {role}
      </div>
      <div>{email}</div>
    </div>
  )
}
