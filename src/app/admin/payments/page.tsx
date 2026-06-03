"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Search } from "lucide-react"

const statuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"]

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [query, setQuery] = useState("")
  const [source, setSource] = useState("ALL")

  const load = () => fetch("/api/admin/payments").then((res) => res.json()).then((data) => { setPayments(data.payments || []); setStats(data.stats || {}) })
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => payments.filter((payment) => {
    const matchesSource = source === "ALL" || payment.source === source
    const matchesQuery = !query || [payment.orderNumber, payment.account, payment.method, payment.status].some((value) => String(value || "").toLowerCase().includes(query.toLowerCase()))
    return matchesSource && matchesQuery
  }), [payments, query, source])

  const updatePayment = async (payment: any, status: string) => {
    const res = await fetch("/api/admin/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: payment.id, source: payment.source, status }) })
    if (!res.ok) return toast.error("Failed to update payment")
    toast.success("Payment updated")
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Payment Management</h2>
        <p className="text-sm text-cavree-muted">Customer and franchise payment review.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[["Total Value", `₹${(stats.total || 0).toLocaleString("en-IN")}`], ["Pending", stats.pending || 0], ["Completed", stats.completed || 0], ["Failed", stats.failed || 0]].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-cavree-border bg-white p-4"><p className="text-sm text-cavree-muted">{label}</p><p className="mt-2 font-montserrat text-2xl font-bold">{value}</p></div>
        ))}
      </div>
      <div className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, account, method, status" className="input pl-9" />
        </div>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="input"><option>ALL</option><option>CUSTOMER</option><option>FRANCHISE</option></select>
      </div>
      <div className="overflow-hidden rounded-lg border border-cavree-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-cavree-light text-left text-xs uppercase text-cavree-muted"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Amount</th></tr></thead>
            <tbody className="divide-y divide-cavree-border">
              {filtered.map((payment) => (
                <tr key={`${payment.source}-${payment.id}`}>
                  <td className="px-4 py-3 font-medium">{payment.orderNumber}</td>
                  <td className="px-4 py-3">{payment.account}</td>
                  <td className="px-4 py-3">{payment.source}</td>
                  <td className="px-4 py-3">{payment.method}</td>
                  <td className="px-4 py-3"><select value={payment.status} onChange={(e) => updatePayment(payment, e.target.value)} className="rounded-full border border-cavree-border px-3 py-1 text-xs">{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></td>
                  <td className="px-4 py-3 text-right font-semibold">₹{payment.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-cavree-muted">No payments found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
