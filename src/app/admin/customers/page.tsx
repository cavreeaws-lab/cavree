"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    params.set("page", String(page))
    params.set("limit", String(limit))
    fetch(`/api/admin/customers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load customers")
        setLoading(false)
      })
  }, [search, page])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">Customers</h2>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search customers..."
            className="w-full border border-cavree-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-cavree-primary"
          />
        </div>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Phone</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Orders</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-cavree-light/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link href={`/admin/customers/${customer.id}`} className="text-cavree-primary hover:underline">
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm font-poppins">{customer.email}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm text-right font-poppins">{customer.orders}</td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(customer.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t border-cavree-border text-sm font-poppins">
          <p className="text-cavree-muted">{total} customers</p>
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
