'use client'

import { Toast } from 'flowbite-react'
import { HiExclamation } from 'react-icons/hi'
import { useToastsContext } from '@/contexts/ToastsContext'

export default function ToastsOverlay() {
  const { toasts } = useToastsContext()

  return (
    <div
      id="toasts-overlay"
      className="absolute max-h-full max-w-sm right-0 top-0 p-4 space-y-2 overflow-y-auto"
    >
      {toasts.map((toast, index) => (
        <Toast key={index} duration={300}>
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200">
            <HiExclamation className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">{toast.message}</div>
          <Toast.Toggle />
        </Toast>
      ))}
    </div>
  )
}
