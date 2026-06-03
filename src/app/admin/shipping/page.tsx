"use client"

import { useEffect, useState } from "react"

export default function AdminShippingPage() {
  const [config, setConfig] = useState<any>(null)
  const [name, setName] = useState("Default")
  const [freeThreshold, setFreeThreshold] = useState<number | "">("")
  const [zones, setZones] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/shipping-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config)
          setName(data.config.name || "Default")
          setFreeThreshold(data.config.freeShippingThreshold || "")
          setZones(data.config.zones || [])
        }
      })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/admin/shipping-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        freeShippingThreshold: freeThreshold ? Number(freeThreshold) : null,
        zones,
      }),
    })
    alert("Saved")
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shipping Configuration</h1>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Config Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Free Shipping Threshold (₹)</label>
          <input
            type="number"
            value={freeThreshold}
            onChange={(e) => setFreeThreshold(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm">Save Configuration</button>
      </form>
    </div>
  )
}
