"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewTicketPage() {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("ORDER")
  const [orderId, setOrderId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, description, category, orderId: orderId || undefined }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) {
      router.push("/account/tickets")
    } else {
      setError(data.error || "Failed to create ticket")
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Support Ticket</h1>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="ORDER">Order Issue</option>
            <option value="PRODUCT">Product Question</option>
            <option value="SHIPPING">Shipping</option>
            <option value="RETURN">Return/Refund</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Order ID (optional)</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="ORD-..."
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white px-6 py-2 rounded-md text-sm disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  )
}
