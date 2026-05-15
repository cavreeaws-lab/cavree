"use client"

import Link from "next/link"
import { useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Failed to send reset link")
      setSent(true)
      toast.success("Reset link sent to your email!")
    } catch {
      toast.error("Failed to send reset link. Please try again.")
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
          <h1 className="mt-4 font-playfair text-2xl font-bold">Reset Password</h1>
          <p className="text-cavree-muted mt-1 font-poppins text-sm">
            {sent ? "Check your email for reset instructions" : "Enter your email to receive reset instructions"}
          </p>
        </div>

        <div className="bg-white border border-cavree-border rounded-lg p-8">
          {!sent ? (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cavree-primary hover:bg-cavree-primary-light disabled:opacity-50 text-white py-2.5 rounded-md font-medium transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-cavree-muted font-poppins text-sm">
                If an account exists with this email, you will receive reset instructions shortly.
              </p>
            </div>
          )}

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
