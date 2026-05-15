"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/super-admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data.settings || [])
        const map: Record<string, string> = {}
        data.settings?.forEach((s: any) => { map[s.key] = s.value || "" })
        setForm(map)
        setLoading(false)
      })
      .catch(() => { toast.error("Failed to load settings"); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/super-admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
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
      <h2 className="font-playfair text-xl font-bold">Platform Settings</h2>
      <form onSubmit={handleSubmit} className="bg-white border border-cavree-border rounded-lg p-6 space-y-4">
        {settings.map((s: any) => (
          <div key={s.key}>
            <label className="block text-sm font-medium mb-1 capitalize">{s.key.replace(/_/g, " ")}</label>
            <input value={form[s.key] || ""} onChange={(e) => setForm({ ...form, [s.key]: e.target.value })} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          </div>
        ))}
        <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light">Save Settings</button>
      </form>
    </div>
  )
}
