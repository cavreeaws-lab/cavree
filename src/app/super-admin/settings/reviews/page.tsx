"use client"

import { useEffect, useState } from "react"

export default function SuperAdminReviewSettingsPage() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/settings/reviews")
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled)
        setLoading(false)
      })
  }, [])

  async function toggle() {
    const next = !enabled
    const res = await fetch("/api/admin/settings/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    })
    if (res.ok) setEnabled(next)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Review Settings</h1>
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Product Reviews</h3>
            <p className="text-sm text-gray-500 mt-1">
              {enabled
                ? "Reviews are currently enabled. Customers can submit and view reviews."
                : "Reviews are currently disabled. No one can submit or view reviews."}
            </p>
          </div>
          <button
            onClick={toggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-green-600" : "bg-gray-200"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
