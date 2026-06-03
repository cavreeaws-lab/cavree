"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [form, setForm] = useState({ name: "", city: "", state: "", address: "", coordinatorName: "", coordinatorEmail: "", coordinatorPhone: "" })
  const [movement, setMovement] = useState({ warehouseId: "", productCode: "", productName: "", quantity: "", type: "IN", reason: "" })
  const load = () => fetch("/api/admin/warehouses").then((res) => res.json()).then((data) => setWarehouses(data.warehouses || []))
  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const coordinators = warehouses.reduce((sum, warehouse) => sum + (warehouse.coordinators?.length || 0), 0)
    const movements = warehouses.flatMap((warehouse) => warehouse.movements || [])
    const lowStock = movements.filter((item: any) => item.type === "LOW_STOCK").length
    return { warehouses: warehouses.length, coordinators, movements: movements.length, lowStock }
  }, [warehouses])

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    const res = await fetch("/api/admin/warehouses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (!res.ok) return toast.error("Failed to create warehouse")
    toast.success("Warehouse created")
    setForm({ name: "", city: "", state: "", address: "", coordinatorName: "", coordinatorEmail: "", coordinatorPhone: "" })
    load()
  }

  const createMovement = async (event: React.FormEvent) => {
    event.preventDefault()
    const res = await fetch("/api/admin/warehouses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...movement, quantity: Number(movement.quantity || 0) }) })
    const data = await res.json()
    if (!res.ok) return toast.error(data.error || "Failed to record movement")
    toast.success("Stock movement recorded")
    setMovement({ warehouseId: "", productCode: "", productName: "", quantity: "", type: "IN", reason: "" })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Warehouse Stock Management</h2>
        <p className="text-sm text-cavree-muted">Warehouse coordinators, stock movement history, and low-stock visibility.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[["Warehouses", stats.warehouses], ["Coordinators", stats.coordinators], ["Movements", stats.movements], ["Low Stock Alerts", stats.lowStock]].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-cavree-border bg-white p-4"><p className="text-sm text-cavree-muted">{label}</p><p className="mt-2 font-montserrat text-2xl font-bold">{value}</p></div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={create} className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-2">
          <h3 className="font-playfair text-lg font-bold md:col-span-2">Create Warehouse / Coordinator</h3>
          {Object.keys(form).map((key) => (
            <input key={key} required={key === "name"} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={key.replace(/([A-Z])/g, " $1")} className="input" />
          ))}
          <button className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">Create Warehouse</button>
        </form>

        <form onSubmit={createMovement} className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-2">
          <h3 className="font-playfair text-lg font-bold md:col-span-2">Record Stock Movement</h3>
          <select required value={movement.warehouseId} onChange={(e) => setMovement({ ...movement, warehouseId: e.target.value })} className="input">
            <option value="">Select warehouse</option>
            {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
          </select>
          <select value={movement.type} onChange={(e) => setMovement({ ...movement, type: e.target.value })} className="input"><option>IN</option><option>OUT</option><option>ADJUSTMENT</option><option>LOW_STOCK</option></select>
          <input value={movement.productCode} onChange={(e) => setMovement({ ...movement, productCode: e.target.value })} placeholder="Product code" className="input" />
          <input required value={movement.productName} onChange={(e) => setMovement({ ...movement, productName: e.target.value })} placeholder="Product name" className="input" />
          <input required type="number" value={movement.quantity} onChange={(e) => setMovement({ ...movement, quantity: e.target.value })} placeholder="Quantity" className="input" />
          <input value={movement.reason} onChange={(e) => setMovement({ ...movement, reason: e.target.value })} placeholder="Reason" className="input" />
          <button className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">Record Movement</button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="rounded-lg border border-cavree-border bg-white p-4">
            <div className="flex items-start justify-between">
              <div><p className="font-semibold">{warehouse.name}</p><p className="text-sm text-cavree-muted">{[warehouse.city, warehouse.state].filter(Boolean).join(", ") || "Location not set"}</p></div>
              <span className="rounded-full bg-cavree-light px-2 py-1 text-xs">{warehouse.isActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div><p className="text-xs uppercase text-cavree-muted">Coordinators</p>{(warehouse.coordinators || []).map((coordinator: any) => <p key={coordinator.id} className="mt-1 text-sm">{coordinator.name} · {coordinator.email}</p>)}{warehouse.coordinators?.length === 0 && <p className="mt-1 text-sm text-cavree-muted">No coordinators assigned.</p>}</div>
              <div><p className="text-xs uppercase text-cavree-muted">Recent movements</p>{(warehouse.movements || []).map((item: any) => <p key={item.id} className="mt-1 text-sm">{item.type}: {item.productName} ({item.quantity})</p>)}{warehouse.movements?.length === 0 && <p className="mt-1 text-sm text-cavree-muted">No movement history.</p>}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
