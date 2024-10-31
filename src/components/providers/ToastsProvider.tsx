'use client'

import { useState } from 'react'
import {
  ToastData,
  ToastOptions,
  ToastsContext,
} from '@/contexts/ToastsContext'

const DEFAULT_DISMISS_DURATION = 5000

export default function ToastsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  function addToast(options: ToastOptions) {
    const id = new Date().getTime().toString() + Math.floor(Math.random() * 1000)
    setToasts(toasts => [
      ...toasts,
      {
        ...options,
        id,
      },
    ])
    if (options.autoDismiss || true) {
      setTimeout(() => {
        const toastCloseButtons = document.querySelectorAll<HTMLElement>(
          `#toast-${id} [aria-label="Close"]`
        )
        toastCloseButtons.forEach((toastCloseButton) => {
          toastCloseButton.click()
        })
      }, options.duration || DEFAULT_DISMISS_DURATION)
    }
  }

  function clear() {
    setToasts([])
  }

  return (
    <ToastsContext.Provider
      value={{
        toasts,
        addToast,
        clear,
      }}
    >
      {children}
    </ToastsContext.Provider>
  )
}
