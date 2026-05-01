// ─── Add setUser to your auth-context.tsx ────────────────────────────────────
// Find your AuthContext interface and add:
//
//   setUser?: (user: User) => void
//
// Then inside your AuthProvider, expose it:
//
//   const [user, setUser] = useState<User | null>(null)
//   ...
//   value={{ user, setUser, token, logout, ... }}
//
// Example minimal auth-context if you need to rebuild it:

"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authApi } from "@/lib/api"
import type { User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("auth_token")
    if (stored) {
      setToken(stored)
      authApi.me(stored)
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem("auth_token")
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await authApi.login(email, password)
    localStorage.setItem("auth_token", t)
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setToken(null)
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}