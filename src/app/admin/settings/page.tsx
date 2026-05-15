"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminSettingsPage() {
  const [franchise, setFranchise] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: "", city: "", state: "", address: "", phone: "", email: "" })

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.franchise) {
          setFranchise(data.franchise)
          setForm({
            name: data.franchise.name || "",
            city: data.franchise.city || "",
            state: data.franchise.state || "",
            address: data.franchise.address || "",
            phone: data.franchise.phone || "",
            email: data.franchise.email || "",
          })
        }
        setLoading(false)
      })
      .catch(() => { toast.error("Failed to load settings"); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error("Failed")
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save settings")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Settings</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-playfair text-xl font-bold">Franchise Settings</h2>
      <form onSubmit={handleSubmit} className="bg-white border border-cavree-border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">City</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">State</label><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary resize-none" /></div>
        <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light">Save Settings</button>
      </form>
    </div>
  )
}
