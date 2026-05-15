"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => { toast.error("Failed to load reports"); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Reports</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0 },
    { label: "Total Revenue", value: `₹${stats?.totalRevenue?.toLocaleString("en-IN") ?? 0}` },
    { label: "Total Customers", value: stats?.totalCustomers ?? 0 },
    { label: "Total Products", value: stats?.totalProducts ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-xl font-bold">Reports</h2>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-cavree-border rounded-lg p-4">
            <p className="text-xs text-cavree-muted font-poppins uppercase">{card.label}</p>
            <p className="text-2xl font-bold font-playfair mt-1">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-cavree-border rounded-lg p-6">
        <h3 className="font-playfair text-lg font-bold mb-4">Recent Orders</h3>
        {stats?.recentOrders?.length > 0 ? (
          <table className="w-full">
            <thead><tr className="bg-cavree-light"><th className="text-left px-4 py-2 text-xs font-semibold text-cavree-muted uppercase">Order #</th><th className="text-left px-4 py-2 text-xs font-semibold text-cavree-muted uppercase">Customer</th><th className="text-right px-4 py-2 text-xs font-semibold text-cavree-muted uppercase">Amount</th><th className="text-left px-4 py-2 text-xs font-semibold text-cavree-muted uppercase">Status</th></tr></thead>
            <tbody className="divide-y divide-cavree-border">
              {stats.recentOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-cavree-light/50">
                  <td className="px-4 py-3 text-sm font-poppins">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">{o.user?.name || "Guest"}</td>
                  <td className="px-4 py-3 text-sm text-right font-poppins">₹{o.total.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${o.status === "DELIVERED" ? "bg-green-100 text-green-800" : o.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-cavree-muted text-sm">No orders yet.</p>
        )}
      </div>
    </div>
  )
}
