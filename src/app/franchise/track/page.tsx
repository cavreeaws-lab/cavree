"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { PackageSearch } from "lucide-react"

export default function FranchiseTrackPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const search = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/franchise/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`)
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      toast.error(data.error || "Order not found")
      setOrder(null)
      return
    }
    setOrder(data.order)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-lg border border-cavree-border bg-white p-6 text-center">
        <PackageSearch className="mx-auto text-cavree-primary" size={38} />
        <h1 className="mt-4 font-playfair text-3xl font-bold">Track Franchise Order</h1>
        <p className="mt-2 text-sm text-cavree-muted">Enter a bulk order number to view delivery-safe tracking details.</p>
        <form onSubmit={search} className="mx-auto mt-6 flex max-w-xl gap-3">
          <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="BULK-..." className="flex-1 rounded-md border border-cavree-border px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <button disabled={loading} className="rounded-md bg-cavree-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? "Checking..." : "Track"}</button>
        </form>
      </div>

      {order && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="rounded-lg border border-cavree-border bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-cavree-muted">Order {order.orderNumber}</p>
            <h2 className="mt-1 font-playfair text-2xl font-bold">{order.status.replace(/_/g, " ")}</h2>
            <div className="mt-5 space-y-4">
              {order.timeline.map((event: any) => (
                <div key={`${event.status}-${event.createdAt}`} className="border-l-2 border-cavree-primary pl-4">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-cavree-muted">{new Date(event.createdAt).toLocaleString("en-IN")}</p>
                  {event.note && <p className="mt-1 text-sm text-cavree-muted">{event.note}</p>}
                </div>
              ))}
            </div>
          </div>
          <aside className="rounded-lg border border-cavree-border bg-white p-5">
            <h3 className="font-playfair text-lg font-bold">Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-cavree-muted">Franchise:</span> {order.franchiseCode}</p>
              <p><span className="text-cavree-muted">Units:</span> {order.totalUnits}</p>
              <p><span className="text-cavree-muted">Pieces:</span> {order.totalPieces?.toLocaleString("en-IN")}</p>
              <p><span className="text-cavree-muted">Payment:</span> {order.paymentStatus}</p>
              <p><span className="text-cavree-muted">Destination:</span> {[order.deliveryCity, order.deliveryState].filter(Boolean).join(", ") || "Registered address"}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
