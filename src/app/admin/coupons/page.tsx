"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: "", description: "", type: "PERCENTAGE", value: "", minOrder: "", maxDiscount: "", startDate: "", endDate: "", isActive: true })
  const [editing, setEditing] = useState<string | null>(null)

  const fetchCoupons = () => {
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => { setCoupons(data.coupons || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load coupons"); setLoading(false) })
  }

  useEffect(() => { fetchCoupons() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/admin/coupons/${editing}` : "/api/admin/coupons"
    const method = editing ? "PUT" : "POST"
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value),
          minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
          maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success(editing ? "Coupon updated" : "Coupon created")
      setShowForm(false)
      setForm({ code: "", description: "", type: "PERCENTAGE", value: "", minOrder: "", maxDiscount: "", startDate: "", endDate: "", isActive: true })
      setEditing(null)
      fetchCoupons()
    } catch {
      toast.error("Failed to save coupon")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Coupon deleted")
      fetchCoupons()
    } catch {
      toast.error("Failed to delete")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Coupons</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">Coupons</h2>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ code: "", description: "", type: "PERCENTAGE", value: "", minOrder: "", maxDiscount: "", startDate: "", endDate: "", isActive: true }) }} className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light">
          {showForm ? "Cancel" : "Add Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-cavree-border rounded-lg p-4 grid grid-cols-4 gap-4">
          <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat</option>
          </select>
          <input placeholder="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <input placeholder="Min Order" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <input placeholder="Max Discount" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <input placeholder="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <input placeholder="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <div className="col-span-4 flex gap-2">
            <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium">{editing ? "Update" : "Create"}</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Code</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Type</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Value</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Status</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Actions</th></tr></thead>
          <tbody className="divide-y divide-cavree-border">
            {coupons.map((c: any) => (
              <tr key={c.id} className="hover:bg-cavree-light/50">
                <td className="px-6 py-4 text-sm font-medium">{c.code}</td>
                <td className="px-6 py-4 text-sm font-poppins">{c.type}</td>
                <td className="px-6 py-4 text-sm font-poppins">{c.value}</td>
                <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => { setEditing(c.id); setForm({ code: c.code, description: c.description || "", type: c.type, value: String(c.value), minOrder: c.minOrder ? String(c.minOrder) : "", maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "", startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "", endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "", isActive: c.isActive }); setShowForm(true) }} className="text-sm text-cavree-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
