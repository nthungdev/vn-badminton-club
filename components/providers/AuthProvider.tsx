'use client'

import { AuthContext, AuthContextUser } from '@/app/contexts/AuthContext'

export interface AuthProviderProps {
  user: AuthContextUser | null
  children: React.ReactNode
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  user,
  children,
}) => {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
