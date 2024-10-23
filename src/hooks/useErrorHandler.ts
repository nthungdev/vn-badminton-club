'use client'

import { UNKNOWN_ERROR } from '@/constants/errorMessages'
import { useToastsContext } from '@/contexts/ToastsContext'
import AppError from '@/lib/AppError'

export default function useErrorHandler() {
  const { addToast } = useToastsContext()

  function handleError(error: unknown) {
    if (error instanceof AppError) {
      addToast({
        message: error.message,
        type: 'error',
      })
    } else {
      addToast({
        message: UNKNOWN_ERROR,
        type: 'error',
      })
    }
  }

  return handleError
}
