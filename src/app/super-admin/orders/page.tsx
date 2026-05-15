"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function SuperAdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  const fetchOrders = () => {
    const url = statusFilter ? `/api/super-admin/orders?status=${statusFilter}` : "/api/super-admin/orders"
    fetch(url)
      .then((res) => res.json())
      .then((data) => { setOrders(data.orders || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load orders"); setLoading(false) })
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">All Orders</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">All Orders</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Order #</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Customer</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Franchise</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Total</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Status</th></tr></thead>
          <tbody className="divide-y divide-cavree-border">
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-cavree-light/50">
                <td className="px-6 py-4 text-sm font-poppins">{o.orderNumber}</td>
                <td className="px-6 py-4 text-sm">{o.user?.name || "Guest"}</td>
                <td className="px-6 py-4 text-sm font-poppins">{o.franchise?.name || "-"}</td>
                <td className="px-6 py-4 text-sm text-right font-poppins">₹{o.total.toLocaleString("en-IN")}</td>
                <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${o.status === "DELIVERED" ? "bg-green-100 text-green-800" : o.status === "CANCELLED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
