'use client'

import { UNKNOWN_ERROR } from '@/constants/errorMessages'
import { useToastsContext } from '@/contexts/ToastsContext'
import AppError from '@/lib/AppError'
import { useCallback } from 'react'

/**
 * @returns handleError function that takes an error and displays a toast
 */
export default function useErrorHandler() {
  const { addToast } = useToastsContext()

  const handleError = useCallback((error: unknown) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return handleError
}
