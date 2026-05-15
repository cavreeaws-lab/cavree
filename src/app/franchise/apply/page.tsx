"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Store, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function FranchiseApplyPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    investment: "",
    space: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/franchise/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to submit application")
      } else {
        setSubmitted(true)
        toast.success("Application submitted successfully!")
      }
    } catch {
      toast.error("Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cavree-light px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="mx-auto text-green-500" />
          <h1 className="font-playfair text-2xl font-bold mt-6">Application Submitted</h1>
          <p className="text-cavree-muted mt-2 font-poppins">
            Thank you for your interest. Our franchise team will contact you within 48 hours.
          </p>
          <Link href="/" className="mt-8 inline-block bg-cavree-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-cavree-primary-light transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cavree-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/franchise" className="inline-flex items-center gap-1 text-sm text-cavree-muted hover:text-cavree-primary mb-6">
          <ArrowLeft size={16} />
          Back to Franchise
        </Link>

        <div className="bg-white border border-cavree-border rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-cavree-primary/10 flex items-center justify-center">
              <Store size={20} className="text-cavree-primary" />
            </div>
            <div>
              <h1 className="font-playfair text-xl font-bold">Franchise Application</h1>
              <p className="text-sm text-cavree-muted font-poppins">Fill out the form below to apply.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 font-poppins">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 font-poppins">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 font-poppins">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 font-poppins">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors"
                  placeholder="Your city"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 font-poppins">Investment Capacity</label>
                <select
                  name="investment"
                  value={form.investment}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors bg-white"
                >
                  <option value="">Select</option>
                  <option value="₹10-15 Lakhs">₹10-15 Lakhs</option>
                  <option value="₹15-25 Lakhs">₹15-25 Lakhs</option>
                  <option value="₹25-50 Lakhs">₹25-50 Lakhs</option>
                  <option value="₹50+ Lakhs">₹50+ Lakhs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 font-poppins">Retail Space (sq. ft.)</label>
                <select
                  name="space"
                  value={form.space}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-cavree-border rounded-md text-sm outline-none focus:border-cavree-primary transition-colors bg-white"
                >
                  <option value="">Select</option>
                  <option value="500-1000">500-1000</option>
                  <option value="1000-2000">1000-2000</option>
                  <option value="2000-5000">2000-5000</option>
                  <option value="5000+">5000+</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cavree-primary hover:bg-cavree-primary-light disabled:opacity-50 text-white py-3 rounded-md font-medium transition-colors"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
