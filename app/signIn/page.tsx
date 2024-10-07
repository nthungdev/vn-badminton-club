'use client'

import BasePage from '@/components/BasePage'
import SignInForm from '@/components/SignInForm'
import { auth } from '@/lib/firebase/clientApp'
import { useEffect } from 'react'

export default function PageSignIn() {
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is signed in')
      } else {
        console.log('User is not signed in')
      }
    })
  }, [])

  return (
    <BasePage>
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl">Sign In</h1>
        <SignInForm />
      </div>
    </BasePage>
  )
}
