import { createContext, useContext } from 'react'
import { Role } from '@/firebase/definitions'

export interface AuthContextUser {
  uid: string
  emailVerified: boolean
  role: Role
  displayName: string
  email: string
}

export interface AuthContextValue {
  user: AuthContextUser | null
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
})

export const useAuth = () => useContext(AuthContext)
