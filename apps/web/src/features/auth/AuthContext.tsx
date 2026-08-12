import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, api } from '../../lib/api'

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

interface AuthValue {
  user: CurrentUser | null
  loading: boolean
  login(email: string, password: string): Promise<void>
  register(name: string, email: string, password: string): Promise<void>
  logout(): Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void api<{ user: CurrentUser }>('/auth/me')
      .then((body) => setUser(body.user))
      .catch((error: unknown) => {
        if (!(error instanceof ApiError) || error.status !== 401) console.error(error)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const body = await api<{ user: CurrentUser }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        setUser(body.user)
      },
      async register(name, email, password) {
        const body = await api<{ user: CurrentUser }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        })
        setUser(body.user)
      },
      async logout() {
        await api('/auth/logout', { method: 'POST' })
        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
