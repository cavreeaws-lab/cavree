"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => { setProducts(data.products || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load inventory"); setLoading(false) })
  }, [])

  const handleStockChange = async (id: string, quantity: number) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Stock updated")
      setProducts(products.map((p) => p.id === id ? { ...p, quantity } : p))
    } catch {
      toast.error("Failed to update stock")
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
      <h2 className="font-playfair text-xl font-bold">Inventory</h2>
      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Product</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">SKU</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Stock</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Status</th></tr></thead>
          <tbody className="divide-y divide-cavree-border">
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-cavree-light/50">
                <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                <td className="px-6 py-4 text-sm font-poppins">{p.sku}</td>
                <td className="px-6 py-4 text-right">
                  <input type="number" value={p.quantity} onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)} className="w-20 border border-cavree-border rounded-md px-2 py-1 text-sm text-right outline-none focus:border-cavree-primary" />
                </td>
                <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${p.quantity > 10 ? "bg-green-100 text-green-800" : p.quantity > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{p.quantity > 10 ? "In Stock" : p.quantity > 0 ? "Low Stock" : "Out of Stock"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
