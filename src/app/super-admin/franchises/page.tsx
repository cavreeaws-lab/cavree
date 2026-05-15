"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function SuperAdminFranchisesPage() {
  const [franchises, setFranchises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/super-admin/franchises")
      .then((res) => res.json())
      .then((data) => { setFranchises(data.franchises || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load franchises"); setLoading(false) })
  }, [])

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
      <h2 className="font-playfair text-xl font-bold">Franchises</h2>
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
      </div>
    </div>
  )
}
