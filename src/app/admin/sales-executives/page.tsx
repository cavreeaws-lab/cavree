"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Edit2, Search } from "lucide-react"

const emptyForm = { name: "", email: "", phone: "", password: "" }

export default function AdminSalesExecutivesPage() {
  const [executives, setExecutives] = useState<any[]>([])
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const load = () => fetch("/api/admin/sales-executives").then((res) => res.json()).then((data) => setExecutives(data.executives || []))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => executives.filter((executive) => !search || [executive.name, executive.email, executive.phone].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))), [executives, search])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    const payload = { ...form, password: form.password || undefined }
    const res = await fetch(editingId ? `/api/admin/sales-executives/${editingId}` : "/api/admin/sales-executives", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) return toast.error(typeof data.error === "string" ? data.error : "Failed to save sales executive")
    setTemporaryPassword(data.temporaryPassword || "")
    toast.success(editingId ? "Sales executive updated" : "Sales executive created")
    setForm(emptyForm)
    setEditingId(null)
    load()
  }

  const edit = (executive: any) => {
    setEditingId(executive.id)
    setForm({ name: executive.name || "", email: executive.email || "", phone: executive.phone || "", password: "" })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Sales Executives</h2>
        <p className="text-sm text-cavree-muted">Create, edit, and monitor retailer assignments and commission credits.</p>
      </div>
      <form onSubmit={save} className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-5">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input" />
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? "New password optional" : "Password optional"} className="input" />
        <button className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">{editingId ? "Update Executive" : "Create Executive"}</button>
      </form>
      {temporaryPassword && <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm">Temporary password: <strong>{temporaryPassword}</strong></div>}
      <div className="relative rounded-lg border border-cavree-border bg-white p-4">
        <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-cavree-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search executives" className="input pl-9" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((executive) => {
          const credits = executive.commissionCredits || []
          const creditTotal = credits.reduce((sum: number, credit: any) => sum + credit.amount, 0)
          return (
            <div key={executive.id} className="rounded-lg border border-cavree-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{executive.name}</p>
                  <p className="text-sm text-cavree-muted">{executive.email}</p>
                </div>
                <button onClick={() => edit(executive)} className="text-cavree-primary"><Edit2 size={16} /></button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-cavree-light p-3"><p className="text-cavree-muted">Retailers</p><p className="font-bold">{executive.assignedRetailers?.length || 0}</p></div>
                <div className="rounded-md bg-cavree-light p-3"><p className="text-cavree-muted">Credits</p><p className="font-bold">₹{creditTotal.toLocaleString("en-IN")}</p></div>
              </div>
              <div className="mt-3 text-xs text-cavree-muted">Status: Active</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
