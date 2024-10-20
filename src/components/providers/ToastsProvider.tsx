'use client'

import { ToastOptions, ToastsContext } from '@/src/app/contexts/ToastsContext'
import { useState } from 'react'

export default function ToastsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = useState<ToastOptions[]>([])

  function addToast(options: ToastOptions) {
    console.log('add toast from provider')
    setToasts([...toasts, { ...options }])
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
