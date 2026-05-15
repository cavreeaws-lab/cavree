"use client"

import { useState, useEffect } from "react"

interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
  image: string | null
  phone?: string | null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Auth load error:", error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    window.location.href = "/"
  }

  return { user, loading, logout, isAuthenticated: !!user }
}
