import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, setAccessToken } from '../lib/api'

interface User {
  id: string
  email: string
  plan: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount via refresh token cookie
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async res => {
        if (!res.ok) return
        const data: { accessToken: string; user: User } = await res.json()
        setAccessToken(data.accessToken)
        setUser(data.user)
      })
      .catch(() => {
        // No active session or timeout — that's fine
      })
      .finally(() => {
        clearTimeout(timeout)
        setIsLoading(false)
      })

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login(email, password)
    setAccessToken(data.accessToken)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const data = await api.auth.register(email, password)
    setAccessToken(data.accessToken)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => {})
    setAccessToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const data = await api.auth.refresh()
    setAccessToken(data.accessToken)
    setUser(data.user)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
