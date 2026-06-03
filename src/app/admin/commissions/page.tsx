"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

export default function AdminCommissionsPage() {
  const [data, setData] = useState<any>({ rules: [], credits: [] })
  const [form, setForm] = useState({ name: "", rate: "", appliesTo: "FRANCHISE" })
  const [status, setStatus] = useState("ALL")
  const load = () => fetch("/api/admin/commissions").then((res) => res.json()).then(setData)
  useEffect(() => { load() }, [])

  const credits = useMemo(() => (data.credits || []).filter((credit: any) => status === "ALL" || credit.status === status), [data.credits, status])
  const totals = useMemo(() => ({
    pending: (data.credits || []).filter((credit: any) => credit.status === "PENDING").reduce((sum: number, credit: any) => sum + credit.amount, 0),
    approved: (data.credits || []).filter((credit: any) => credit.status === "APPROVED").reduce((sum: number, credit: any) => sum + credit.amount, 0),
    paid: (data.credits || []).filter((credit: any) => credit.status === "PAID").reduce((sum: number, credit: any) => sum + credit.amount, 0),
  }), [data.credits])

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    const res = await fetch("/api/admin/commissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, rate: Number(form.rate) }) })
    if (!res.ok) return toast.error("Failed to save commission rule")
    toast.success("Commission rule saved")
    setForm({ name: "", rate: "", appliesTo: "FRANCHISE" })
    load()
  }

  const updateCredit = async (creditId: string, nextStatus: string) => {
    const res = await fetch("/api/admin/commissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creditId, status: nextStatus }) })
    if (!res.ok) return toast.error("Failed to update credit")
    toast.success("Commission credit updated")
    load()
  }

  const toggleRule = async (rule: any) => {
    const res = await fetch("/api/admin/commissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ruleId: rule.id, isActive: !rule.isActive }) })
    if (!res.ok) return toast.error("Failed to update rule")
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Commission Management</h2>
        <p className="text-sm text-cavree-muted">Rules, pending credits, approval, and payment status.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[["Rules", data.rules?.length || 0], ["Pending", `₹${totals.pending.toLocaleString("en-IN")}`], ["Approved", `₹${totals.approved.toLocaleString("en-IN")}`], ["Paid", `₹${totals.paid.toLocaleString("en-IN")}`]].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-cavree-border bg-white p-4"><p className="text-sm text-cavree-muted">{label}</p><p className="mt-2 font-montserrat text-2xl font-bold">{value}</p></div>
        ))}
      </div>
      <form onSubmit={create} className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-4">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rule name" className="input" />
        <input required type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="Rate %" className="input" />
        <select value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value })} className="input"><option>FRANCHISE</option><option>SALES_EXECUTIVE</option><option>RETAILER</option></select>
        <button className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">Create Rule</button>
      </form>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-cavree-border bg-white">
          <div className="border-b border-cavree-border p-4 font-semibold">Rules</div>
          {(data.rules || []).map((rule: any) => <div key={rule.id} className="flex items-center justify-between border-b border-cavree-border p-4 last:border-0"><div><p className="font-medium">{rule.name}</p><p className="text-sm text-cavree-muted">{rule.rate}% · {rule.appliesTo}</p></div><button onClick={() => toggleRule(rule)} className="rounded-full bg-cavree-light px-3 py-1 text-xs">{rule.isActive ? "Active" : "Inactive"}</button></div>)}
        </div>
        <div className="rounded-lg border border-cavree-border bg-white">
          <div className="flex items-center justify-between border-b border-cavree-border p-4">
            <span className="font-semibold">Credits</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-cavree-border px-2 py-1 text-xs"><option>ALL</option><option>PENDING</option><option>APPROVED</option><option>PAID</option><option>REJECTED</option></select>
          </div>
          {credits.map((credit: any) => <div key={credit.id} className="border-b border-cavree-border p-4 last:border-0"><div className="flex justify-between"><div><p className="font-medium">{credit.retailer?.businessName || credit.user?.name || credit.source}</p><p className="text-sm text-cavree-muted">{credit.rate}% · {credit.status}</p></div><span className="font-semibold">₹{credit.amount.toLocaleString("en-IN")}</span></div><div className="mt-3 flex gap-2"><button onClick={() => updateCredit(credit.id, "APPROVED")} className="rounded-md border border-cavree-border px-3 py-1 text-xs">Approve</button><button onClick={() => updateCredit(credit.id, "PAID")} className="rounded-md bg-cavree-primary px-3 py-1 text-xs text-white">Mark Paid</button><button onClick={() => updateCredit(credit.id, "REJECTED")} className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-700">Reject</button></div></div>)}
          {credits.length === 0 && <p className="p-8 text-center text-sm text-cavree-muted">No credits found.</p>}
        </div>
      </div>
    </div>
  )
}
