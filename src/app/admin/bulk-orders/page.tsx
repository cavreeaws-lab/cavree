"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Download, Search } from "lucide-react"

const statuses = ["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"]
const paymentStatuses = ["", "PENDING", "COMPLETED", "FAILED", "REFUNDED"]

export default function AdminBulkOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [loading, setLoading] = useState(true)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (status) params.set("status", status)
    if (paymentStatus) params.set("paymentStatus", paymentStatus)
    return params.toString()
  }, [search, status, paymentStatus])

  const load = () => {
    setLoading(true)
    fetch(`/api/admin/bulk-orders?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || [])
        setStats(data.stats || {})
      })
      .catch(() => toast.error("Failed to load bulk orders"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [query])

  const updateOrder = async (orderId: string, patch: Record<string, string>) => {
    const res = await fetch("/api/admin/bulk-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, ...patch }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Failed to update order")
      return
    }
    toast.success("Bulk order updated")
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-playfair text-xl font-bold">Bulk Orders</h2>
          <p className="text-sm text-cavree-muted">Franchise order operations, payment status, and timeline control.</p>
        </div>
        <a href={`/api/admin/bulk-orders?${query}&export=csv`} className="inline-flex items-center gap-2 rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">
          <Download size={16} /> Export CSV
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Orders", stats.total || 0],
          ["Pending", stats.pending || 0],
          ["Units", stats.units || 0],
          ["Revenue", `₹${(stats.revenue || 0).toLocaleString("en-IN")}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-cavree-border bg-white p-4">
            <p className="text-sm text-cavree-muted">{label}</p>
            <p className="mt-2 font-montserrat text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 lg:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, franchise, retailer" className="w-full rounded-md border border-cavree-border py-2 pl-9 pr-3 text-sm outline-none focus:border-cavree-primary" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-cavree-border px-3 py-2 text-sm">
          {statuses.map((item) => <option key={item || "ALL"} value={item}>{item || "All statuses"}</option>)}
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="rounded-md border border-cavree-border px-3 py-2 text-sm">
          {paymentStatuses.map((item) => <option key={item || "ALL"} value={item}>{item || "All payments"}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-cavree-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-cavree-light text-left text-xs uppercase text-cavree-muted">
              <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Retailer</th><th className="px-4 py-3">Units</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-cavree-muted">Loading bulk orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-cavree-muted">No bulk orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3"><p className="font-medium">{order.orderNumber}</p><p className="text-xs text-cavree-muted">{order.franchiseCode}</p></td>
                  <td className="px-4 py-3">{order.retailer?.businessName || order.deliveryName || "-"}</td>
                  <td className="px-4 py-3">{order.totalUnits} / {order.totalPieces?.toLocaleString("en-IN")} pcs</td>
                  <td className="px-4 py-3">
                    <select value={order.paymentStatus} onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value })} className="rounded-full border border-cavree-border px-3 py-1 text-xs">
                      {paymentStatuses.filter(Boolean).map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={order.status} onChange={(e) => updateOrder(order.id, { status: e.target.value })} className="rounded-full border border-cavree-border px-3 py-1 text-xs">
                      {statuses.filter(Boolean).map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">₹{order.total.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
