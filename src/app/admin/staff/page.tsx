"use client"

import { useEffect, useState } from "react"

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "STAFF" })

  useEffect(() => {
    fetch("/api/admin/staff")
      .then((r) => r.json())
      .then((data) => {
        setStaff(data.staff || [])
        setLoading(false)
      })
  }, [])

  async function createStaff(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: "", email: "", phone: "", password: "", role: "STAFF" })
      const refreshed = await fetch("/api/admin/staff").then((r) => r.json())
      setStaff(refreshed.staff || [])
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Franchise Staff</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-black text-white px-4 py-2 rounded-md text-sm">
          {showForm ? "Cancel" : "Add Staff"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createStaff} className="border rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
            <input placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="INVENTORY_MANAGER">Inventory Manager</option>
            </select>
          </div>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm">Create</button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2">Name</th>
            <th className="text-left px-4 py-2">Email</th>
            <th className="text-left px-4 py-2">Role</th>
            <th className="text-left px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-4 py-2">{s.name}</td>
              <td className="px-4 py-2">{s.email}</td>
              <td className="px-4 py-2">{s.role}</td>
              <td className="px-4 py-2">
                <span className={`text-xs px-2 py-1 rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
