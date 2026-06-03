"use client"

import { useEffect, useState } from "react"
import { Star, CheckCircle, XCircle, Trash2, Plus } from "lucide-react"
import toast from "react-hot-toast"

function customerInitials(name?: string | null) {
  const parts = (name || "Anonymous").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "A"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [filter, setFilter] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    productId: "",
    customerName: "",
    rating: 5,
    comment: "",
  })

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/reviews?status=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || [])
        setSelectedIds([])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load reviews")
        setLoading(false)
      })
  }, [filter])

  useEffect(() => {
    fetch("/api/admin/products?limit=200&isActive=true")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => toast.error("Failed to load products"))
  }, [])

  const handleCreateReview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.productId || !form.customerName.trim() || !form.comment.trim()) {
      toast.error("Select product, customer name, and review")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          customerName: form.customerName.trim(),
          rating: form.rating,
          comment: form.comment.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message = typeof data.error === "string" ? data.error : "Failed to create review"
        throw new Error(message)
      }
      if (filter !== "pending") {
        setReviews((prev) => [data.review, ...prev])
      }
      setForm({ productId: "", customerName: "", rating: 5, comment: "" })
      toast.success("Review created")
    } catch (error: any) {
      toast.error(error.message || "Failed to create review")
    } finally {
      setCreating(false)
    }
  }

  const handleApprove = async (id: string) => {
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      })
      if (!res.ok) throw new Error()
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r)))
      toast.success("Review approved")
    } catch {
      toast.error("Failed to approve review")
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      })
      if (!res.ok) throw new Error()
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: false } : r)))
      toast.success("Review rejected")
    } catch {
      toast.error("Failed to reject review")
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success("Review deleted")
    } catch {
      toast.error("Failed to delete review")
    } finally {
      setActionId(null)
    }
  }

  const handleBulk = async (action: "APPROVE" | "REJECT" | "DELETE") => {
    if (selectedIds.length === 0) return
    if (action === "DELETE" && !confirm("Delete selected reviews permanently?")) return
    try {
      const res = await fetch("/api/admin/reviews/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewIds: selectedIds, action }),
      })
      if (!res.ok) throw new Error()
      if (action === "DELETE") {
        setReviews((prev) => prev.filter((review) => !selectedIds.includes(review.id)))
      } else {
        setReviews((prev) => prev.map((review) => selectedIds.includes(review.id) ? { ...review, isApproved: action === "APPROVE" } : review))
      }
      setSelectedIds([])
      toast.success("Selected reviews updated")
    } catch {
      toast.error("Failed to update selected reviews")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-xl font-bold">Reviews</h2>
          <p className="text-sm text-cavree-muted font-poppins">Moderate customer feedback and publish approved reviews.</p>
        </div>
        <div className="flex items-center gap-2">
          {["pending", "approved", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-cavree-primary text-white" : "bg-white border border-cavree-border text-cavree-muted hover:text-cavree-foreground"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleCreateReview} className="rounded-lg border border-cavree-border bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} className="text-cavree-primary" />
          <div>
            <h3 className="font-montserrat text-sm font-semibold">Create product review</h3>
            <p className="text-xs text-cavree-muted">Admin-created reviews are approved immediately.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cavree-muted">Product</span>
            <select
              value={form.productId}
              onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
              className="w-full rounded-md border border-cavree-border px-3 py-2 text-sm"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cavree-muted">Customer name</span>
            <input
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              placeholder="First Last"
              className="w-full rounded-md border border-cavree-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-cavree-muted">Rating</span>
            <select
              value={form.rating}
              onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))}
              className="w-full rounded-md border border-cavree-border px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating} stars</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {creating ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-medium text-cavree-muted">Review</span>
          <textarea
            value={form.comment}
            onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
            rows={3}
            placeholder="Write the product review"
            className="w-full rounded-md border border-cavree-border px-3 py-2 text-sm"
          />
        </label>
      </form>

      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-cavree-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-poppins">{selectedIds.length} selected</p>
          <div className="flex gap-2">
            <button onClick={() => handleBulk("APPROVE")} className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white">Approve</button>
            <button onClick={() => handleBulk("REJECT")} className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-white">Reject</button>
            <button onClick={() => handleBulk("DELETE")} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white">Delete</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3"><input type="checkbox" checked={reviews.length > 0 && selectedIds.length === reviews.length} onChange={(e) => setSelectedIds(e.target.checked ? reviews.map((review) => review.id) : [])} /></th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Rating</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Comment</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-cavree-muted">Loading...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-cavree-muted">No reviews found</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-cavree-light/50 transition-colors">
                    <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(review.id)} onChange={(e) => setSelectedIds((prev) => e.target.checked ? [...prev, review.id] : prev.filter((id) => id !== review.id))} /></td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {review.product?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm font-poppins">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cavree-primary/10 text-xs font-semibold text-cavree-primary">
                          {customerInitials(review.user?.name)}
                        </span>
                        <span>{review.user?.name || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "text-cavree-accent fill-cavree-accent" : "text-gray-300"} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-poppins max-w-xs truncate">{review.comment || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${review.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review.id)}
                            disabled={actionId === review.id}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {review.isApproved && (
                          <button
                            onClick={() => handleReject(review.id)}
                            disabled={actionId === review.id}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={actionId === review.id}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
