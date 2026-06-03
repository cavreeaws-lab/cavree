"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Edit2, Search } from "lucide-react"

const emptyForm = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  gstNumber: "",
  city: "",
  state: "",
  address: "",
  status: "ACTIVE",
  paymentStatus: "PENDING",
  agreementStatus: "PENDING",
  renewalStatus: "NOT_DUE",
  warehouseStockValue: "",
  salesExecutiveId: "",
  notes: "",
}

export default function AdminRetailersPage() {
  const [retailers, setRetailers] = useState<any[]>([])
  const [executives, setExecutives] = useState<any[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("ALL")

  const load = () => fetch("/api/admin/retailers").then((res) => res.json()).then((data) => setRetailers(data.retailers || []))
  useEffect(() => {
    load()
    fetch("/api/admin/sales-executives").then((res) => res.json()).then((data) => setExecutives(data.executives || []))
  }, [])

  const filtered = useMemo(() => retailers.filter((retailer) => {
    const matchesSearch = !search || [retailer.businessName, retailer.ownerName, retailer.email, retailer.franchiseCode].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = status === "ALL" || retailer.status === status
    return matchesSearch && matchesStatus
  }), [retailers, search, status])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    const payload = {
      ...form,
      warehouseStockValue: form.warehouseStockValue ? Number(form.warehouseStockValue) : 0,
      salesExecutiveId: form.salesExecutiveId || undefined,
    }
    const res = await fetch(editingId ? `/api/admin/retailers/${editingId}` : "/api/admin/retailers", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Failed to save retailer")
      return
    }
    toast.success(editingId ? "Retailer updated" : "Retailer created")
    setForm(emptyForm)
    setEditingId(null)
    load()
  }

  const edit = (retailer: any) => {
    setEditingId(retailer.id)
    setForm({
      businessName: retailer.businessName || "",
      ownerName: retailer.ownerName || "",
      email: retailer.email || "",
      phone: retailer.phone || "",
      gstNumber: retailer.gstNumber || "",
      city: retailer.city || "",
      state: retailer.state || "",
      address: retailer.address || "",
      status: retailer.status || "ACTIVE",
      paymentStatus: retailer.paymentStatus || "PENDING",
      agreementStatus: retailer.agreementStatus || "PENDING",
      renewalStatus: retailer.renewalStatus || "NOT_DUE",
      warehouseStockValue: String(retailer.warehouseStockValue || ""),
      salesExecutiveId: retailer.salesExecutiveId || "",
      notes: retailer.notes || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Retailers / Franchise Stores</h2>
        <p className="text-sm text-cavree-muted">Assignments, payment status, agreements, renewals, stock value, and order totals.</p>
      </div>
      <form onSubmit={save} className="space-y-3 rounded-lg border border-cavree-border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="Business name" className="input" />
          <input required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner name" className="input" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input" />
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input" />
          <input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} placeholder="GST" className="input" />
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="input" />
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="input" />
          <select value={form.salesExecutiveId} onChange={(e) => setForm({ ...form, salesExecutiveId: e.target.value })} className="input">
            <option value="">Unassigned executive</option>
            {executives.map((executive) => <option key={executive.id} value={executive.id}>{executive.name}</option>)}
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input"><option>ACTIVE</option><option>PENDING</option><option>SUSPENDED</option><option>INACTIVE</option></select>
          <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} className="input"><option>PENDING</option><option>COMPLETED</option><option>FAILED</option><option>REFUNDED</option></select>
          <select value={form.agreementStatus} onChange={(e) => setForm({ ...form, agreementStatus: e.target.value })} className="input"><option>PENDING</option><option>SIGNED</option><option>EXPIRED</option><option>REVIEW</option></select>
          <select value={form.renewalStatus} onChange={(e) => setForm({ ...form, renewalStatus: e.target.value })} className="input"><option>NOT_DUE</option><option>DUE</option><option>OVERDUE</option><option>RENEWED</option></select>
          <input type="number" value={form.warehouseStockValue} onChange={(e) => setForm({ ...form, warehouseStockValue: e.target.value })} placeholder="Warehouse stock value" className="input" />
        </div>
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Business address" rows={2} className="input resize-none" />
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes" rows={2} className="input resize-none" />
        <button className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">{editingId ? "Update Retailer" : "Create Retailer"}</button>
      </form>

      <div className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search business, owner, email, code" className="input pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input"><option>ALL</option><option>ACTIVE</option><option>PENDING</option><option>SUSPENDED</option><option>INACTIVE</option></select>
      </div>

      <div className="overflow-hidden rounded-lg border border-cavree-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-cavree-light text-left text-xs uppercase text-cavree-muted"><tr><th className="px-4 py-3">Business</th><th className="px-4 py-3">Executive</th><th className="px-4 py-3">Statuses</th><th className="px-4 py-3">Stock/Orders</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-cavree-border">
              {filtered.map((retailer) => (
                <tr key={retailer.id}>
                  <td className="px-4 py-3"><p className="font-medium">{retailer.businessName}</p><p className="text-xs text-cavree-muted">{retailer.franchiseCode} · {retailer.ownerName}</p></td>
                  <td className="px-4 py-3">{retailer.salesExecutive?.name || "Unassigned"}</td>
                  <td className="px-4 py-3"><p>{retailer.status}</p><p className="text-xs text-cavree-muted">Pay {retailer.paymentStatus} · Agreement {retailer.agreementStatus} · Renewal {retailer.renewalStatus}</p></td>
                  <td className="px-4 py-3">₹{retailer.warehouseStockValue?.toLocaleString("en-IN") || 0}<p className="text-xs text-cavree-muted">{retailer._count?.bulkOrders || 0} orders</p></td>
                  <td className="px-4 py-3">{retailer.email}<p className="text-xs text-cavree-muted">{retailer.phone}</p></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => edit(retailer)} className="inline-flex items-center gap-1 text-cavree-primary"><Edit2 size={15} /> Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
