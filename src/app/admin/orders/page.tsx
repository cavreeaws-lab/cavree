"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const allStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (filter !== "ALL") params.set("status", filter)
    params.set("page", String(page))
    params.set("limit", String(limit))
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load orders")
        setLoading(false)
      })
  }, [search, filter, page])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === status ? "bg-cavree-primary text-white" : "bg-white border border-cavree-border text-cavree-muted hover:text-cavree-foreground"}`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search order or customer..."
            className="w-full border border-cavree-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-cavree-primary"
          />
        </div>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Payment</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-cavree-light/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link href={`/admin/orders/${order.id}`} className="text-cavree-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm font-poppins">{order.user?.name || "Guest"}</td>
                  <td className="px-6 py-4 text-sm text-cavree-muted font-poppins">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          setUpdatingId(order.id)
                          try {
                            const res = await fetch(`/api/admin/orders/${order.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: newStatus }),
                            })
                            if (!res.ok) throw new Error("Update failed")
                            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)))
                            toast.success("Status updated")
                          } catch {
                            toast.error("Failed to update status")
                          } finally {
                            setUpdatingId(null)
                          }
                        }}
                        className="text-xs border border-cavree-border rounded px-2 py-1 bg-white outline-none focus:border-cavree-primary"
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <span className="text-xs text-cavree-muted">Saving...</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-poppins">{order.payment?.method || "COD"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t border-cavree-border text-sm font-poppins">
          <p className="text-cavree-muted">{total} orders</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-cavree-light disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
            <button onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))} disabled={page * limit >= total} className="p-1 rounded hover:bg-cavree-light disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
