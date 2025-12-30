"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getGuestData, getOrCreateGuestId } from "./guest-storage"
import { mergeGuestDataWithUser } from "./data-sync"

interface UserProfile {
  id: string
  email: string
  username: string
  displayName: string
  xp: number
  level: number
  currentStreak: number
  bestStreak: number
  totalGamesPlayed: number
  totalPoints: number
  subscriptionTier: "free" | "pro" | "elite"
}

interface AuthContextType {
  user: UserProfile | null
  isGuest: boolean
  isLoading: boolean
  guestId: string
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  playAsGuest: () => void
  syncGuestData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isGuest, setIsGuest] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [guestId, setGuestId] = useState("")

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const userId = localStorage.getItem("user_id")

        if (token && userId) {
          // Fetch user profile from MongoDB
          const response = await fetch("/api/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            setIsGuest(false)
          } else {
            // Token invalid, clear and use guest mode
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_id")
            setIsGuest(true)
            setGuestId(getOrCreateGuestId())
          }
        } else {
          // No session, use guest mode
          setIsGuest(true)
          setGuestId(getOrCreateGuestId())
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setIsGuest(true)
        setGuestId(getOrCreateGuestId())
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const { user: userData, token } = await response.json()

      // Store token and user ID
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_id", userData.id)

      setUser(userData)
      setIsGuest(false)

      const guestData = getGuestData()
      if (guestData.scores.length > 0 || guestData.xp > 0) {
        await mergeGuestDataWithUser(userData.id, guestData)
      }
    } catch (error) {
      throw error
    }
  }

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, displayName }),
      })

      if (!response.ok) {
        throw new Error("Signup failed")
      }

      const { user: userData, token } = await response.json()

      // Store token and user ID
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_id", userData.id)

      setUser(userData)
      setIsGuest(false)

      const guestData = getGuestData()
      if (guestData.scores.length > 0 || guestData.xp > 0) {
        await mergeGuestDataWithUser(userData.id, guestData)
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_id")
      setUser(null)
      setIsGuest(true)
      setGuestId(getOrCreateGuestId())
    }
  }

  const playAsGuest = () => {
    setIsGuest(true)
    setGuestId(getOrCreateGuestId())
  }

  const syncGuestData = async () => {
    if (!isGuest || !user) return

    try {
      const guestData = getGuestData()
      await mergeGuestDataWithUser(user.id, guestData)
    } catch (error) {
      console.error("Error syncing guest data:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isLoading,
        guestId,
        login,
        signup,
        logout,
        playAsGuest,
        syncGuestData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
