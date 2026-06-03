"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Copy, Plus, Search, Ticket, Trash2 } from "lucide-react"

const emptyForm = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  minOrder: "",
  maxDiscount: "",
  usageLimit: "",
  perCustomerLimit: "",
  startDate: "",
  endDate: "",
  isActive: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("ALL")

  const fetchCoupons = () => {
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => { setCoupons(data.coupons || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load coupons"); setLoading(false) })
  }

  useEffect(() => { fetchCoupons() }, [])

  const filteredCoupons = useMemo(() => coupons.filter((coupon) => {
    const matchesQuery = !query || coupon.code.toLowerCase().includes(query.toLowerCase()) || coupon.description?.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === "ALL" || (status === "ACTIVE" ? coupon.isActive : !coupon.isActive)
    return matchesQuery && matchesStatus
  }), [coupons, query, status])

  const reset = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
  }

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
          code: form.code.toUpperCase(),
          value: parseFloat(form.value),
          minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
          maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
          perCustomerLimit: form.perCustomerLimit ? parseInt(form.perCustomerLimit) : undefined,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success(editing ? "Coupon updated" : "Coupon created")
      reset()
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

  const beginEdit = (c: any) => {
    setEditing(c.id)
    setForm({
      code: c.code,
      description: c.description || "",
      type: c.type,
      value: String(c.value),
      minOrder: c.minOrder ? String(c.minOrder) : "",
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      perCustomerLimit: c.perCustomerLimit ? String(c.perCustomerLimit) : "",
      startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "",
      endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "",
      isActive: c.isActive,
    })
    setShowForm(true)
  }

  if (loading) {
    return <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-playfair text-xl font-bold">Coupons</h2>
          <p className="text-sm text-cavree-muted font-poppins">Create discount rules, usage limits, and customer eligibility.</p>
        </div>
        <button onClick={() => { if (showForm) reset(); else setShowForm(true) }} className="inline-flex items-center gap-2 bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light">
          <Plus size={16} />
          {showForm ? "Cancel" : "Add Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-cavree-border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="input uppercase" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              <option value="PERCENTAGE">Percentage</option>
              <option value="FLAT">Flat amount</option>
            </select>
            <input placeholder="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="input" />
            <input placeholder="Min Order" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="input" />
            <input placeholder="Max Discount" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="input" />
            <input placeholder="Total usage limit" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input" />
            <input placeholder="Per-customer limit" type="number" value={form.perCustomerLimit} onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value })} className="input" />
            <input placeholder="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input" />
            <input placeholder="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" />
            <label className="flex items-center gap-2 text-sm font-poppins"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input resize-none" />
          <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium">{editing ? "Update" : "Create"}</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search coupons..." className="input pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Code</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Rule</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Usage</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Status</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Actions</th></tr></thead>
          <tbody className="divide-y divide-cavree-border">
            {filteredCoupons.map((c: any) => (
              <tr key={c.id} className="hover:bg-cavree-light/50">
                <td className="px-6 py-4 text-sm font-medium"><span className="inline-flex items-center gap-2"><Ticket size={15} className="text-cavree-primary" />{c.code}</span></td>
                <td className="px-6 py-4 text-sm font-poppins">
                  {c.type === "PERCENTAGE" ? `${c.value}% off` : `₹${c.value} off`}
                  <p className="text-xs text-cavree-muted">Min ₹{c.minOrder || 0}{c.maxDiscount ? ` · Max ₹${c.maxDiscount}` : ""}</p>
                </td>
                <td className="px-6 py-4 text-sm font-poppins">{c.usageCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}<p className="text-xs text-cavree-muted">Per customer: {c.perCustomerLimit || "No limit"}</p></td>
                <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => navigator.clipboard.writeText(c.code).then(() => toast.success("Copied"))} className="mr-2 rounded p-1.5 text-cavree-muted hover:bg-cavree-light"><Copy size={16} /></button>
                  <button onClick={() => beginEdit(c)} className="mr-2 text-sm text-cavree-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
