'use client'

import BasePage from '@/components/BasePage'
import SignInForm from '@/components/SignInForm'

export default function PageSignIn() {
  return (
    <BasePage>
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl">Sign In</h1>
        <SignInForm />
      </div>
    </BasePage>
  )
}
