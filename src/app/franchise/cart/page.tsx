"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

export default function FranchiseCartPage() {
  const [data, setData] = useState<any>(null)

  const loadCart = () => fetch("/api/franchise/cart").then((res) => res.json()).then(setData)
  useEffect(() => { loadCart() }, [])

  const removeItem = async (itemId: string) => {
    await fetch(`/api/franchise/cart?itemId=${itemId}`, { method: "DELETE" })
    toast.success("Removed")
    loadCart()
  }

  const updateQuantity = async (item: any, unitCount: number) => {
    if (unitCount < item.product.minUnits) {
      toast.error(`Minimum ${item.product.minUnits} unit(s) required`)
      return
    }
    const res = await fetch("/api/franchise/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: item.productId, unitCount }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Could not update quantity")
      return
    }
    setData(data)
  }

  const items = data?.cart?.items || []
  const summary = data?.summary || { subtotal: 0, tax: 0, total: 0, totalUnits: 0, totalPieces: 0 }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-cavree-border bg-white">
        <div className="border-b border-cavree-border p-4">
          <h2 className="font-playfair text-xl font-bold">Franchise Cart</h2>
          <p className="text-sm text-cavree-muted">Selected wholesale units and generated unit IDs.</p>
        </div>
        <div className="divide-y divide-cavree-border">
          {items.map((item: any) => (
            <div key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-cavree-muted">{item.product.productId} · {item.unitCount} units · {(item.unitCount * item.unitSize).toLocaleString("en-IN")} pieces</p>
                  <p className="mt-2 text-xs text-cavree-muted">{item.selectedUnitCodes.join(", ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-md border border-cavree-border">
                    <button onClick={() => updateQuantity(item, item.unitCount - 1)} className="p-2"><Minus size={14} /></button>
                    <span className="w-9 text-center text-sm font-semibold">{item.unitCount}</span>
                    <button onClick={() => updateQuantity(item, item.unitCount + 1)} className="p-2"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="rounded-md border border-cavree-border p-2 text-red-600 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-right font-semibold">₹{item.total.toLocaleString("en-IN")}</p>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-10 text-center">
              <ShoppingBag className="mx-auto text-cavree-muted" size={34} />
              <p className="mt-3 text-sm text-cavree-muted">Your franchise cart is empty.</p>
              <Link href="/franchise/store" className="mt-4 inline-flex rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">Browse bulk catalog</Link>
            </div>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-cavree-border bg-white p-5">
        <h3 className="font-playfair text-lg font-bold">Order Summary</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Units</span><span>{summary.totalUnits}</span></div>
          <div className="flex justify-between"><span>Pieces</span><span>{summary.totalPieces?.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>Subtotal</span><span>₹{summary.subtotal?.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>GST</span><span>₹{summary.tax?.toLocaleString("en-IN")}</span></div>
          <div className="border-t border-cavree-border pt-3 font-semibold flex justify-between"><span>Total</span><span>₹{summary.total?.toLocaleString("en-IN")}</span></div>
        </div>
        <Link href="/franchise/checkout" className={`mt-5 block rounded-md px-4 py-3 text-center text-sm font-medium text-white ${items.length ? "bg-cavree-primary" : "pointer-events-none bg-gray-300"}`}>
          Continue to Checkout
        </Link>
      </aside>
    </div>
  )
}
