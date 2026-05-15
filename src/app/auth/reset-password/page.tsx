"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error("Invalid or missing reset token")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to reset password")
      } else {
        setDone(true)
        toast.success("Password reset successfully!")
      }
    } catch {
      toast.error("Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 font-poppins text-sm">Invalid or expired reset link.</p>
        <Link href="/auth/forgot-password" className="mt-4 inline-block text-cavree-primary hover:underline text-sm">
          Request a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600 font-poppins text-sm mb-4">Your password has been reset successfully.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 bg-cavree-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-cavree-primary-light transition-colors">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5 font-poppins">New Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-10 pr-10 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
            placeholder="Enter new password"
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

      <div>
        <label className="block text-sm font-medium mb-1.5 font-poppins">Confirm Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cavree-primary hover:bg-cavree-primary-light disabled:opacity-50 text-white py-2.5 rounded-md font-medium transition-colors"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cavree-light px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-playfair text-3xl font-bold text-cavree-primary">
            CAVREE
          </Link>
          <h1 className="mt-4 font-playfair text-2xl font-bold">Reset Password</h1>
          <p className="text-cavree-muted mt-1 font-poppins text-sm">Enter your new password below.</p>
        </div>

        <div className="bg-white border border-cavree-border rounded-lg p-8">
          <Suspense fallback={<p className="text-center text-sm text-cavree-muted font-poppins">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center text-sm font-poppins">
            <Link href="/auth/login" className="text-cavree-primary hover:underline font-medium inline-flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
