'use client'

import { createContext, useContext } from 'react'

export type ToastType = 'info' | 'success' | 'error'

export interface ToastOptions {
  message: string
  type: ToastType
}

export interface ToastsContext {
  toasts: ToastOptions[]
  addToast: (options: ToastOptions) => void
  clear: () => void
}

export const ToastsContext = createContext<ToastsContext>({
  toasts: [],
  addToast: () => {},
  clear: () => {},
})

export const useToastsContext = () => useContext(ToastsContext)
