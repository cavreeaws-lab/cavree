"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/super-admin/users")
      .then((res) => res.json())
      .then((data) => { setUsers(data.users || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load users"); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Users</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-xl font-bold">Users</h2>
      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Role</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-cavree-light/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{u.name || "-"}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-poppins">{u._count?.orders || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
