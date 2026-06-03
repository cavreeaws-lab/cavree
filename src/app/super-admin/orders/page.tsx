"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react"
import toast from "react-hot-toast"

const PAGE_SIZE = 20
const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"]

export default function SuperAdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    if (paymentMethod) params.set("paymentMethod", paymentMethod)
    params.set("page", String(page))
    params.set("limit", String(PAGE_SIZE))
    return params.toString()
  }, [search, statusFilter, paymentMethod, page])

  const fetchOrders = () => {
    setLoading(true)
    fetch(`/api/super-admin/orders?${query}`)
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
  }

  useEffect(() => {
    fetchOrders()
  }, [query])

  const exportCsv = () => {
    const params = new URLSearchParams(query)
    params.set("export", "csv")
    window.location.href = `/api/super-admin/orders?${params.toString()}`
  }

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/super-admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      toast.error("Failed to update order")
      return
    }

    toast.success("Order updated")
    fetchOrders()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-playfair text-xl font-bold">All Orders</h2>
          <p className="mt-1 text-sm text-cavree-muted">Monitor platform-wide order flow, payment mix, and franchise fulfillment.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white hover:bg-cavree-primary/90">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 lg:grid-cols-[1fr_180px_160px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cavree-muted" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search order, customer, email, or franchise"
            className="w-full rounded-md border border-cavree-border py-2 pl-10 pr-3 text-sm outline-none focus:border-cavree-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPage(1)
          }}
          className="rounded-md border border-cavree-border px-3 py-2 text-sm outline-none focus:border-cavree-primary"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={paymentMethod}
          onChange={(event) => {
            setPaymentMethod(event.target.value)
            setPage(1)
          }}
          className="rounded-md border border-cavree-border px-3 py-2 text-sm outline-none focus:border-cavree-primary"
        >
          <option value="">All payments</option>
          <option value="COD">COD</option>
          <option value="RAZORPAY">Razorpay</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-cavree-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="bg-cavree-light">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Franchise</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Payment</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-cavree-muted">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-cavree-muted">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-cavree-muted">No orders found.</td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-cavree-light/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-cavree-text">{order.orderNumber}</div>
                      <div className="mt-1 text-xs text-cavree-muted">{new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{order.user?.name || "Guest"}</div>
                      <div className="mt-1 text-xs text-cavree-muted">{order.user?.email || "-"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-poppins">{order.franchise?.name || "-"}</td>
                    <td className="px-6 py-4 text-sm font-poppins">
                      <div>{order.payment?.method || "-"}</div>
                      <div className="mt-1 text-xs text-cavree-muted">{order.payment?.status || "PENDING"}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-poppins">₹{order.total.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(event) => updateStatus(order.id, event.target.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium outline-none ${
                          order.status === "DELIVERED"
                            ? "border-green-200 bg-green-100 text-green-800"
                            : order.status === "CANCELLED" || order.status === "REFUNDED"
                              ? "border-red-200 bg-red-100 text-red-800"
                              : "border-blue-200 bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-cavree-muted">
        <span>{total.toLocaleString("en-IN")} orders</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-cavree-border p-2 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-md border border-cavree-border p-2 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
