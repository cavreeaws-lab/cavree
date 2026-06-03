"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminSettingsPage() {
  const [franchise, setFranchise] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Profile")
  const [form, setForm] = useState({ name: "", city: "", state: "", address: "", phone: "", email: "", adminId: "", theme: "light", accentColor: "teal", notifications: "enabled", region: "India", currentPassword: "", newPassword: "" })

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setFranchise(data.franchise || null)
        setForm((prev) => ({
          ...prev,
          name: data.franchise?.name || "",
          city: data.franchise?.city || "",
          state: data.franchise?.state || "",
          address: data.franchise?.address || "",
          phone: data.franchise?.phone || "",
          email: data.franchise?.email || "",
          adminId: data.settings?.adminId || "",
          theme: data.settings?.theme || "light",
          accentColor: data.settings?.accentColor || "teal",
          notifications: data.settings?.notifications || "enabled",
          region: data.settings?.region || "India",
        }))
        setLoading(false)
      })
      .catch(() => { toast.error("Failed to load settings"); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, currentPassword: form.currentPassword || undefined, newPassword: form.newPassword || undefined }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("Settings saved")
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }))
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings")
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
    <div className="space-y-6 max-w-4xl">
      <h2 className="font-playfair text-xl font-bold">Settings</h2>
      <form onSubmit={handleSubmit} className="bg-white border border-cavree-border rounded-lg">
        <div className="flex overflow-x-auto border-b border-cavree-border px-4">
          {["Profile", "Security", "Appearance", "Preferences"].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`border-b-2 px-4 py-3 text-sm font-medium ${activeTab === tab ? "border-cavree-primary text-cavree-primary" : "border-transparent text-cavree-muted"}`}>{tab}</button>
          ))}
        </div>
        <div className="space-y-4 p-6">
          {activeTab === "Profile" && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                <Field label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
                <Field label="Admin ID" value={form.adminId} onChange={(value) => setForm({ ...form, adminId: value })} />
                <Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
                <Field label="City" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
                <Field label="State" value={form.state} onChange={(value) => setForm({ ...form, state: value })} />
              </div>
              <div><label className="block text-sm font-medium mb-1">Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary resize-none" /></div>
            </>
          )}
          {activeTab === "Security" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Current password" type="password" value={form.currentPassword} onChange={(value) => setForm({ ...form, currentPassword: value })} />
              <Field label="New password" type="password" value={form.newPassword} onChange={(value) => setForm({ ...form, newPassword: value })} />
              <p className="rounded-md bg-cavree-light p-4 text-sm text-cavree-muted md:col-span-2">New passwords must be 8+ characters and include uppercase, lowercase, and a number.</p>
            </div>
          )}
          {activeTab === "Appearance" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Theme" value={form.theme} onChange={(value) => setForm({ ...form, theme: value })} />
              <Field label="Accent color" value={form.accentColor} onChange={(value) => setForm({ ...form, accentColor: value })} />
            </div>
          )}
          {activeTab === "Preferences" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Notifications" value={form.notifications} onChange={(value) => setForm({ ...form, notifications: value })} />
              <Field label="Region" value={form.region} onChange={(value) => setForm({ ...form, region: value })} />
            </div>
          )}
          <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light">Save Settings</button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
    </div>
  )
}
