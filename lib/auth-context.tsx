"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi, User, RegisterData } from "./api"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // localStorage = rememberMe (persists), sessionStorage = session only (clears on tab close)
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token")

    if (!storedToken) {
      setIsLoading(false)
      return
    }

    setToken(storedToken)

    authApi
      .me(storedToken)
      .then((userData) => {
        setUser(userData)
      })
      .catch((err) => {
        console.error("me failed:", err)
        localStorage.removeItem("token")
        sessionStorage.removeItem("token")
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await authApi.login(email, password)

    if (rememberMe) {
      localStorage.setItem("token", response.token)
      sessionStorage.removeItem("token")
    } else {
      sessionStorage.setItem("token", response.token)
      localStorage.removeItem("token")
    }

    setToken(response.token)
    setUser(response.user)
    router.push("/dashboard")
  }

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data)
    sessionStorage.setItem("token", response.token)
    setToken(response.token)
    setUser(response.user)
    router.push("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}