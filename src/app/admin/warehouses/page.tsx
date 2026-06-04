"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Search, X, Package, Loader2 } from "lucide-react"

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [form, setForm] = useState({ name: "", city: "", state: "", address: "", coordinatorName: "", coordinatorEmail: "", coordinatorPhone: "" })
  const [movement, setMovement] = useState({ warehouseId: "", productCode: "", productName: "", quantity: "", type: "IN", reason: "" })
  const [productQuery, setProductQuery] = useState("")
  const [productResults, setProductResults] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [searchingProducts, setSearchingProducts] = useState(false)
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const productSearchRef = useRef<HTMLDivElement>(null)
  const load = () => fetch("/api/admin/warehouses").then((res) => res.json()).then((data) => setWarehouses(data.warehouses || []))
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!productQuery.trim() || productQuery.length < 2) {
      setProductResults([])
      setShowProductDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      setSearchingProducts(true)
      try {
        const res = await fetch(`/api/admin/products?search=${encodeURIComponent(productQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          setProductResults(data.products || [])
          setShowProductDropdown(true)
        }
      } finally {
        setSearchingProducts(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [productQuery])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (productSearchRef.current && !productSearchRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product)
    setMovement((m) => ({
      ...m,
      productCode: product.sku || "",
      productName: product.name || "",
    }))
    setProductQuery("")
    setShowProductDropdown(false)
    setProductResults([])
  }

  const handleClearProduct = () => {
    setSelectedProduct(null)
    setMovement((m) => ({ ...m, productCode: "", productName: "" }))
  }

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
    setSelectedProduct(null)
    setProductQuery("")
    setShowProductDropdown(false)
    setProductResults([])
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

          {/* Product search / selected product */}
          <div className="md:col-span-2 relative" ref={productSearchRef}>
            {!selectedProduct ? (
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
                <input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  onFocus={() => productResults.length > 0 && setShowProductDropdown(true)}
                  placeholder="Search product by code, name, or model..."
                  className="input w-full pl-9 pr-9"
                />
                {productQuery && (
                  <button
                    type="button"
                    onClick={() => { setProductQuery(""); setProductResults([]); setShowProductDropdown(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cavree-muted hover:text-cavree-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
                {showProductDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-cavree-border bg-white shadow-lg max-h-60 overflow-auto">
                    {searchingProducts ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-cavree-muted">
                        <Loader2 size={16} className="animate-spin" /> Searching...
                      </div>
                    ) : productResults.length === 0 ? (
                      <div className="py-4 text-center text-sm text-cavree-muted">No products found</div>
                    ) : (
                      productResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-cavree-light transition-colors"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-cavree-light">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cavree-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-cavree-muted">
                              SKU: {product.sku}
                              {product.modelNumber ? ` · Model: ${product.modelNumber}` : ""}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-md border border-cavree-border bg-cavree-light/50 p-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white">
                  {selectedProduct.images?.[0]?.url ? (
                    <img src={selectedProduct.images[0].url} alt={selectedProduct.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package size={20} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cavree-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{selectedProduct.name}</p>
                  <p className="text-xs text-cavree-muted">
                    SKU: {selectedProduct.sku}
                    {selectedProduct.modelNumber ? ` · Model: ${selectedProduct.modelNumber}` : ""}
                    {selectedProduct.quantity !== undefined ? ` · Stock: ${selectedProduct.quantity}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearProduct}
                  className="text-cavree-muted hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

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
