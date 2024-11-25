'use client'

import { initApp } from '@/firebase/clientApp'
import { useEffect } from 'react'

export default function AnalyticsTrigger() {
  useEffect(() => {
    initApp()
  }, [])

  return <div className="hidden"></div>
}
