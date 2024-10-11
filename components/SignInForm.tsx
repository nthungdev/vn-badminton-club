'use client'

import { signIn } from '@/actions/auth'
import { useFormState, useFormStatus } from 'react-dom'

const INPUT_EMAIL_ID = 'sign-up-input-email'
const INPUT_PASSWORD_ID = 'sign-up-input-password'

export default function SignInForm() {
  const [state, action] = useFormState(signIn, undefined)
  const { pending } = useFormStatus();

  return (
    <form className="w-full space-y-3" action={action}>
      <div className="relative">
        <input
          type="email"
          name="email"
          id={INPUT_EMAIL_ID}
          className="peer p-4 block w-full bg-gray-100 border-transparent rounded-lg text-sm placeholder:text-transparent focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none
          focus:pt-6
          focus:pb-2
          [&:not(:placeholder-shown)]:pt-6
          [&:not(:placeholder-shown)]:pb-2
          autofill:pt-6
          autofill:pb-2"
          placeholder="you@email.com"
          required
        />
        <label
          htmlFor={INPUT_EMAIL_ID}
          className="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent origin-[0_0] peer-disabled:opacity-50 peer-disabled:pointer-events-none
          peer-focus:scale-90
          peer-focus:translate-x-0.5
          peer-focus:-translate-y-1.5
          peer-focus:text-gray-500
          peer-[:not(:placeholder-shown)]:scale-90
          peer-[:not(:placeholder-shown)]:translate-x-0.5
          peer-[:not(:placeholder-shown)]:-translate-y-1.5
          peer-[:not(:placeholder-shown)]:text-gray-500"
        >
          Email
        </label>
      </div>
      {state?.inputErrors?.email && <p>{state.inputErrors.email}</p>}

      <div className="relative">
        <input
          type="password"
          name="password"
          id={INPUT_PASSWORD_ID}
          className="peer p-4 block w-full bg-gray-100 border-transparent rounded-lg text-sm placeholder:text-transparent focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none
          focus:pt-6
          focus:pb-2
          [&:not(:placeholder-shown)]:pt-6
          [&:not(:placeholder-shown)]:pb-2
          autofill:pt-6
          autofill:pb-2"
          placeholder="********"
          required
        />
        <label
          htmlFor={INPUT_PASSWORD_ID}
          className="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent origin-[0_0] peer-disabled:opacity-50 peer-disabled:pointer-events-none
          peer-focus:scale-90
          peer-focus:translate-x-0.5
          peer-focus:-translate-y-1.5
          peer-focus:text-gray-500
          peer-[:not(:placeholder-shown)]:scale-90
          peer-[:not(:placeholder-shown)]:translate-x-0.5
          peer-[:not(:placeholder-shown)]:-translate-y-1.5
          peer-[:not(:placeholder-shown)]:text-gray-500"
        >
          Password
        </label>
      </div>
      {state?.inputErrors?.password && (
        <div className='text-red-600 px-2'>
          <p>Password must:</p>
          <ul>
            {state.inputErrors.password.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-primary text-white hover:bg-primary-700 focus:outline-none focus:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
        disabled={pending}
      >
        Sign In
      </button>
      {state?.signInError && <p className='text-red-600'>{state.signInError}</p>}
    </form>
  )
}
