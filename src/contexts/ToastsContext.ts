'use client'

import { createContext, useContext } from 'react'

export type ToastType = 'info' | 'success' | 'error'

export interface ToastData {
  id: string
  message: string
  type: ToastType
}

export interface ToastOptions {
  message: string
  type: ToastType
  /** default is true */
  autoDismiss?: boolean
  /** default is 5s */
  duration?: number
}

export interface ToastsContext {
  toasts: ToastData[]
  addToast: (options: ToastOptions) => void
  clear: () => void
}

export const ToastsContext = createContext<ToastsContext>({
  toasts: [],
  addToast: () => {},
  clear: () => {},
})

export const useToastsContext = () => useContext(ToastsContext)
