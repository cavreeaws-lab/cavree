"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Search, ChevronLeft, ChevronRight, History, Plus, Minus } from "lucide-react"

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [adjustForm, setAdjustForm] = useState({ quantity: 0, reason: "" })
  const limit = 10

  const fetchProducts = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    params.set("page", String(page))
    params.set("limit", String(limit))
    fetch(`/api/admin/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => { setProducts(data.products || []); setTotal(data.total || 0); setLoading(false) })
      .catch(() => { toast.error("Failed to load inventory"); setLoading(false) })
  }

  const fetchHistory = () => {
    fetch("/api/admin/inventory/history?limit=50")
      .then((res) => res.json())
      .then((data) => setHistory(data.adjustments || []))
      .catch(() => toast.error("Failed to load history"))
  }

  useEffect(() => { fetchProducts() }, [search, page])

  const handleAdjust = async (productId: string) => {
    if (!adjustForm.reason.trim()) {
      toast.error("Please provide a reason")
      return
    }
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: adjustForm.quantity, reason: adjustForm.reason }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Stock adjusted")
      setAdjustingId(null)
      setAdjustForm({ quantity: 0, reason: "" })
      fetchProducts()
      fetchHistory()
    } catch {
      toast.error("Failed to adjust stock")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Inventory</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-playfair text-xl font-bold">Inventory</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory() }}
            className="inline-flex items-center gap-1 border border-cavree-border px-3 py-2 rounded-md text-sm font-medium hover:bg-cavree-light transition-colors"
          >
            <History size={16} /> {showHistory ? "Back to Stock" : "History"}
          </button>
        </div>
      </div>

      {!showHistory ? (
        <>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search products..."
              className="w-full border border-cavree-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-cavree-primary"
            />
          </div>

          <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Product</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">SKU</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Stock</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Status</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Actions</th></tr></thead>
              <tbody className="divide-y divide-cavree-border">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-cavree-light/50">
                    <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-sm font-poppins">{p.sku}</td>
                    <td className="px-6 py-4 text-right text-sm font-poppins">{p.quantity}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${p.quantity > 10 ? "bg-green-100 text-green-800" : p.quantity > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{p.quantity > 10 ? "In Stock" : p.quantity > 0 ? "Low Stock" : "Out of Stock"}</span></td>
                    <td className="px-6 py-4 text-right">
                      {adjustingId === p.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => setAdjustForm((prev) => ({ ...prev, quantity: prev.quantity - 1 }))} className="p-1 border rounded hover:bg-cavree-light"><Minus size={14} /></button>
                          <input type="number" value={adjustForm.quantity} onChange={(e) => setAdjustForm((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))} className="w-16 border border-cavree-border rounded px-2 py-1 text-sm text-right" />
                          <button onClick={() => setAdjustForm((prev) => ({ ...prev, quantity: prev.quantity + 1 }))} className="p-1 border rounded hover:bg-cavree-light"><Plus size={14} /></button>
                          <input value={adjustForm.reason} onChange={(e) => setAdjustForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Reason" className="w-32 border border-cavree-border rounded px-2 py-1 text-sm" />
                          <button onClick={() => handleAdjust(p.id)} className="text-xs bg-cavree-primary text-white px-2 py-1 rounded">Save</button>
                          <button onClick={() => setAdjustingId(null)} className="text-xs text-cavree-muted hover:text-cavree-foreground">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setAdjustingId(p.id); setAdjustForm({ quantity: 0, reason: "" }) }} className="text-sm text-cavree-primary hover:underline">Adjust</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-6 py-3 border-t border-cavree-border text-sm font-poppins">
              <p className="text-cavree-muted">{total} products</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-cavree-light disabled:opacity-30"><ChevronLeft size={18} /></button>
                <span className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
                <button onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))} disabled={page * limit >= total} className="p-1 rounded hover:bg-cavree-light disabled:opacity-30"><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Date</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Product</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Change</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Reason</th></tr></thead>
            <tbody className="divide-y divide-cavree-border">
              {history.map((h: any) => (
                <tr key={h.id} className="hover:bg-cavree-light/50">
                  <td className="px-6 py-4 text-sm font-poppins">{new Date(h.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-6 py-4 text-sm font-medium">{h.productId}</td>
                  <td className={`px-6 py-4 text-sm text-right font-medium ${h.quantity >= 0 ? "text-green-600" : "text-red-600"}`}>{h.quantity > 0 ? `+${h.quantity}` : h.quantity}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{h.reason}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-cavree-muted font-poppins">No adjustments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
