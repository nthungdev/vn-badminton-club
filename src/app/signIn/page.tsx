'use client'

import BasePage from '@/src/components/BasePage'
import SignInForm from '@/src/components/SignInForm'

export default function PageSignIn() {
  return (
    <BasePage>
      <div className="max-w-md mx-auto px-4 space-y-10 text-center">
        <h1 className="text-4xl">Sign In</h1>
        <SignInForm />
      </div>
    </BasePage>
  )
}