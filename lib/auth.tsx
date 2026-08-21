'use client'
import { createContext, useContext } from 'react'
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react'

type User = { email: string; name?: string; roles: string[] }
type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  roles: string[]
  hasRole: (...roles: string[]) => boolean
  login: (identifiant: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const roles = session?.roles ?? []

  const user: User | null = session?.user
    ? { email: session.user.email ?? '', name: session.user.name ?? undefined, roles }
    : null

  const login = async (identifiant: string, password: string) => {
    const res = await signIn('credentials', {
      username: identifiant,
      password,
      redirect: false,
    })
    return !res?.error
  }

  const logout = () => {
    void signOut({ redirectTo: '/login' })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: status === 'loading',
        roles,
        hasRole: (...r) => r.some((x) => roles.includes(x)),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthBridge>{children}</AuthBridge>
    </SessionProvider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth doit etre utilise dans AuthProvider')
  return value
}