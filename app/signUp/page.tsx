'use client'

import BasePage from '@/components/BasePage'
import SignUpForm from '@/components/SignUpForm'

export default function PageSignUp() {

  return (
    <BasePage>
      <div className="max-w-md mx-auto px-4 space-y-10 text-center">
        <h1 className="text-4xl">Sign In</h1>
        <SignUpForm />
      </div>
    </BasePage>
  )
}
