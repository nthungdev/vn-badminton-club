'use client'

import { ToastOptions, useToastsContext } from '@/app/contexts/ToastsContext'
import { Toast } from 'flowbite-react'
import { HiExclamation } from 'react-icons/hi'

function makeToast(options: ToastOptions) {
  return (
    <Toast duration={300}>
      <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200">
        <HiExclamation className="h-5 w-5" />
      </div>
      <div className="ml-3 text-sm font-normal">{options.message}</div>
      <Toast.Toggle />
    </Toast>
  )
}

export default function ToastsOverlay() {
  // const { toasts } = useToasts()
  const { toasts } = useToastsContext()

  console.log('toasts', toasts)

  return (
    <div
      id="toasts-overlay"
      className="absolute max-h-full right-0 top-0 p-4 space-y-2 overflow-y-auto"
    >
      {toasts.map((toast, index) => (
        <div key={index}>{makeToast(toast)}</div>
      ))}
    </div>
  )
}
