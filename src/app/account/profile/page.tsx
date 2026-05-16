"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { User, Mail, Phone, Camera } from "lucide-react"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Profile updated!")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-cavree-border rounded-lg p-6">
      <h2 className="font-playfair text-xl font-bold mb-6">Profile Information</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-20 h-20 rounded-full bg-cavree-primary/10 flex items-center justify-center">
          <User size={32} className="text-cavree-primary" />
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-cavree-primary text-white rounded-full flex items-center justify-center hover:bg-cavree-primary-light transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h3 className="font-montserrat font-semibold">{user?.name || "User"}</h3>
          <p className="text-sm text-cavree-muted font-poppins">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1.5 font-poppins">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 font-poppins">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 font-poppins">Phone</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-cavree-primary hover:bg-cavree-primary-light disabled:opacity-50 text-white px-6 py-2.5 rounded-md font-medium transition-colors"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
