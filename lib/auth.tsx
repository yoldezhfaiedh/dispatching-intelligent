'use client'
import { createContext, useContext, useEffect, useState } from 'react'

// TEMPORAIRE : sera remplacé par NestJS + Keycloak. Ne pas utiliser en production.
type User = { email: string }
type AuthContextValue = { user: User | null; isAuthenticated: boolean; login: (email: string, password: string) => boolean; logout: () => void }
const AuthContext = createContext<AuthContextValue | null>(null)
export function AuthProvider({ children }: { children: React.ReactNode }) { const [user, setUser] = useState<User | null>(null); useEffect(() => { const email = document.cookie.split('; ').find(item => item.startsWith('dispatch_user='))?.split('=')[1]; if (email) setUser({ email: decodeURIComponent(email) }) }, []); const login = (email: string, password: string) => { if (email === 'admin@orange.tn' && password === 'admin') { document.cookie = `dispatch_user=${encodeURIComponent(email)}; path=/; max-age=86400; samesite=lax`; setUser({ email }); return true } return false }; const logout = () => { document.cookie = 'dispatch_user=; path=/; max-age=0'; setUser(null) }; return <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>{children}</AuthContext.Provider> }
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth doit être utilisé dans AuthProvider'); return value }
