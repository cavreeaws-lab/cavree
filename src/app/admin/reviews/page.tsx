"use client"

import { useEffect, useState } from "react"
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [filter, setFilter] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/reviews?status=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load reviews")
        setLoading(false)
      })
  }, [filter])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">Reviews</h2>
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

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
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
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-cavree-muted">Loading...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-cavree-muted">No reviews found</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-cavree-light/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">
                      {review.product?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm font-poppins">{review.user?.name || "Anonymous"}</td>
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
