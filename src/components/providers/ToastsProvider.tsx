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
    console.log('add toast from provider')
    const id = new Date().getTime().toString()
    setToasts([
      ...toasts,
      {
        ...options,
        id,
      },
    ])
    if (options.autoDismiss || true) {
      setTimeout(() => {
        const toastCloseButton = document.querySelector<HTMLElement>(`#toast-${id} [aria-label="Close"]`)
        if (toastCloseButton) {
          toastCloseButton.click()
        }
        // setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
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
