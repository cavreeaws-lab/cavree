"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, ClipboardList, ExternalLink, PackageSearch, ShoppingCart, Store } from "lucide-react"

export default function FranchiseDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/franchise/dashboard")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-64 animate-pulse rounded-lg border border-cavree-border bg-white" />

  const stats = data?.stats || {}
  const profile = data?.profile || {}
  const orders = data?.recentOrders || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-bold">{profile.name}</h2>
          <p className="text-sm text-cavree-muted">Code {profile.franchiseCode} · {profile.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.franchiseSlug && (
            <Link href={`/store/${profile.franchiseSlug}`} target="_blank" className="inline-flex items-center gap-2 rounded-md border border-cavree-border bg-white px-4 py-2 text-sm font-medium hover:bg-cavree-light">
              View Public Store <ExternalLink size={16} />
            </Link>
          )}
          <Link href="/franchise/store" className="inline-flex items-center gap-2 rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">
            Start Bulk Order <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Orders", stats.orders || 0, ClipboardList],
          ["Total Items", stats.totalItems || 0, PackageSearch],
          ["Cart Items", stats.cartItems || 0, ShoppingCart],
          ["Catalog Items", stats.activeProducts || 0, Store],
        ].map(([label, value, Icon]: any) => (
          <div key={label} className="rounded-lg border border-cavree-border bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-cavree-muted">{label}</p>
              <Icon size={18} className="text-cavree-primary" />
            </div>
            <p className="mt-3 font-montserrat text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-cavree-border bg-white">
          <div className="border-b border-cavree-border p-4">
            <h3 className="font-playfair text-lg font-bold">Recent Orders</h3>
          </div>
          <div className="divide-y divide-cavree-border">
            {orders.map((order: any) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-cavree-light">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-cavree-muted">{order.totalItems || 0} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{order.total.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-cavree-muted">{order.status}</p>
                </div>
              </Link>
            ))}
            {orders.length === 0 && <p className="p-8 text-center text-sm text-cavree-muted">No orders yet.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-cavree-border bg-white p-5">
          <h3 className="font-playfair text-lg font-bold">Business Profile</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p><span className="text-cavree-muted">Owner:</span> {profile.ownerName || "Not set"}</p>
            <p><span className="text-cavree-muted">Phone:</span> {profile.phone || "Not set"}</p>
            <p><span className="text-cavree-muted">Email:</span> {profile.email || "Not set"}</p>
            <p><span className="text-cavree-muted">Location:</span> {[profile.city, profile.state].filter(Boolean).join(", ") || "Not set"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
