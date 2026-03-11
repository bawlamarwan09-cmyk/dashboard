"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi, User, RegisterData } from "./api"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
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
  const storedToken = localStorage.getItem("token")
  console.log("stored token on mount:", storedToken)

  if (!storedToken) {
    setIsLoading(false)
    return
  }

  setToken(storedToken)

  authApi
    .me(storedToken)
    .then((userData) => {
      console.log("me response:", userData)
      setUser(userData)
    })
    .catch((err) => {
      console.error("me failed:", err)  // ← THIS will tell us the real error
      localStorage.removeItem("token")
      setToken(null)
      setUser(null)
    })
    .finally(() => {
      setIsLoading(false)
    })
}, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    localStorage.setItem("token", response.token)
    console.log("login response:", response)
  console.log("token:", response.token)     // add this
    setToken(response.token)
    setUser(response.user)
    router.push("/dashboard")
  }

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data)
    localStorage.setItem("token", response.token)
    setToken(response.token)
    setUser(response.user)
    router.push("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem("token")
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