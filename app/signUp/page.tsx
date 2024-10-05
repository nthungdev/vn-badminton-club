'use client'

import SignUpForm from '@/components/SignUpForm'

export default function PageSignUp() {

  return (
    <div>
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl">Sign up</h1>
        <SignUpForm />
      </div>
    </div>
  )
}
