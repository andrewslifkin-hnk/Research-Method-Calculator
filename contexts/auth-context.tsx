"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the context type
type AuthContextType = {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
})

// Admin password - in a real app, this would be stored securely on the server
const ADMIN_PASSWORD = "matrix-admin"

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("admin-auth")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // Login function
  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("admin-auth", "true")
      return true
    }
    return false
  }

  // Logout function
  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin-auth")
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)
