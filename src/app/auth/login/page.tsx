"use client"

import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import toast from "react-hot-toast"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const redirectParam = searchParams.get("redirect")
  const registered = searchParams.get("registered")

  useEffect(() => {
    if (registered === "1") {
      toast.success("Account created. Please sign in.")
    }
  }, [registered])

  const normalizeRedirectTarget = (target: string) => {
    try {
      const isAbsolute = /^https?:\/\//.test(target)
      const url = isAbsolute ? new URL(target) : new URL(target, window.location.origin)

      if (url.pathname === "/admin" || url.pathname === "/admin/") {
        url.pathname = "/admin/dashboard"
      }

      if (url.pathname === "/super-admin" || url.pathname === "/super-admin/") {
        url.pathname = "/super-admin/dashboard"
      }

      if (url.pathname === "/franchise/" || url.pathname === "/franchise/dashboard/") {
        url.pathname = "/franchise/dashboard"
      }

      if (url.pathname === "/sales" || url.pathname === "/sales/") {
        url.pathname = "/sales/dashboard"
      }

      return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`
    } catch {
      return target
    }
  }

  const navigateAfterLogin = (target: string) => {
    if (/^https?:\/\//.test(target)) {
      window.location.href = target
      return
    }
    router.push(target)
  }

  const canRoleAccessTarget = (role: string | undefined, target: string) => {
    try {
      const url = /^https?:\/\//.test(target) ? new URL(target) : new URL(target, window.location.origin)
      if (url.hostname === "admin.cavree.com") return role === "ADMIN" || role === "SUPER_ADMIN"
      if (url.hostname === "franchise.cavree.com") return role === "FRANCHISEE" || role === "ADMIN" || role === "SUPER_ADMIN"
      if (url.hostname === "sales.cavree.com") return role === "SALES_EXECUTIVE" || role === "ADMIN" || role === "SUPER_ADMIN"
      if (url.hostname === "super-admin.cavree.com") return role === "SUPER_ADMIN"
      if (url.pathname.startsWith("/admin")) return role === "FRANCHISEE" || role === "ADMIN" || role === "SUPER_ADMIN"
      if (url.pathname.startsWith("/franchise/") && url.pathname !== "/franchise/apply") return role === "FRANCHISEE" || role === "ADMIN" || role === "SUPER_ADMIN"
      if (url.pathname.startsWith("/sales")) return role === "SALES_EXECUTIVE" || role === "ADMIN" || role === "SUPER_ADMIN"
      if (url.pathname.startsWith("/super-admin")) return role === "SUPER_ADMIN"
      return true
    } catch {
      return true
    }
  }

  const getRoleRedirect = (role: string | undefined) => {
    const hostname = window.location.hostname
    const isProductionDomain = hostname === "cavree.com" || hostname.endsWith(".cavree.com")
    if (!isProductionDomain) {
      if (role === "SUPER_ADMIN") return "/super-admin/dashboard"
      if (role === "ADMIN") return "/admin/dashboard"
      if (role === "FRANCHISEE") return "/franchise/dashboard"
      if (role === "SALES_EXECUTIVE") return "/sales/dashboard"
      return "/account/orders"
    }
    if (role === "SUPER_ADMIN") return "https://super-admin.cavree.com/super-admin/dashboard"
    if (role === "ADMIN") return "https://admin.cavree.com/admin/dashboard"
    if (role === "FRANCHISEE") return "https://franchise.cavree.com/franchise/dashboard"
    if (role === "SALES_EXECUTIVE") return "https://sales.cavree.com/sales/dashboard"
    return "/account/orders"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Login successful!")
        const target = normalizeRedirectTarget(redirectParam || getRoleRedirect(data.user?.role))
        if (!canRoleAccessTarget(data.user?.role, target)) {
          toast.error("This account does not have access to that portal.")
          return
        }

        navigateAfterLogin(target)
        router.refresh()
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cavree-light px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-playfair text-3xl font-bold text-cavree-primary">
            CAVREE
          </Link>
          <h1 className="mt-4 font-playfair text-2xl font-bold">Welcome Back</h1>
          <p className="text-cavree-muted mt-1 font-poppins text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white border border-cavree-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 font-poppins">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 font-poppins">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cavree-muted"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-poppins">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-cavree-border" />
                <span className="text-cavree-muted">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-cavree-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cavree-primary hover:bg-cavree-primary-light disabled:opacity-50 text-white py-2.5 rounded-md font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-poppins">
            <span className="text-cavree-muted">Don&apos;t have an account? </span>
            <Link href="/auth/register" className="text-cavree-primary hover:underline font-medium">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cavree-light">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
