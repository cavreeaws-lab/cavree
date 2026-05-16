"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function SuperAdminFranchisesPage() {
  const [franchises, setFranchises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    params.set("page", String(page))
    params.set("limit", String(limit))
    fetch(`/api/super-admin/franchises?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => { setFranchises(data.franchises || []); setTotal(data.total || 0); setLoading(false) })
      .catch(() => { toast.error("Failed to load franchises"); setLoading(false) })
  }, [search, statusFilter, page])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Franchises</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-playfair text-xl font-bold">Franchises</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search franchises..."
              className="w-full border border-cavree-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-cavree-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">City</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Owner</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {franchises.map((f: any) => (
                <tr key={f.id} className="hover:bg-cavree-light/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{f.name}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{f.city || "-"}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{f.owner?.name || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${f.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {f.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-poppins">{f._count?.products || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t border-cavree-border text-sm font-poppins">
          <p className="text-cavree-muted">{total} franchises</p>
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
