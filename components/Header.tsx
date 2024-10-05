'use client'
import { menu } from '@/app/lib/menu'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-outer-space-600 text-sm py-3">
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
        </div>
      </nav>
    </header>
  )
}
