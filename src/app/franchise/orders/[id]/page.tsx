"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CheckCircle2, Clock, PackageCheck, Truck } from "lucide-react"

const stageMap = [
  { status: "PENDING", label: "Order placed", icon: Clock },
  { status: "CONFIRMED", label: "Production confirmed", icon: CheckCircle2 },
  { status: "PROCESSING", label: "Quality check", icon: PackageCheck },
  { status: "SHIPPED", label: "Dispatched", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
]

export default function FranchiseOrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/franchise/orders/${params.id}`).then((res) => res.json()).then((data) => setOrder(data.order))
  }, [params.id])

  if (!order) return <div className="h-64 animate-pulse rounded-lg border border-cavree-border bg-white" />
  const currentIndex = Math.max(0, stageMap.findIndex((stage) => stage.status === order.status))

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-lg border border-cavree-border bg-white p-5">
          <p className="text-sm text-cavree-muted">Bulk Order</p>
          <h2 className="font-playfair text-2xl font-bold">{order.orderNumber}</h2>
          <p className="mt-2 text-sm">{order.totalUnits} units · {order.totalPieces.toLocaleString("en-IN")} pieces · {order.status}</p>
        </div>
        <div className="rounded-lg border border-cavree-border bg-white p-5">
          <h3 className="font-playfair text-lg font-bold">Order Progress</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {stageMap.map((stage, index) => {
              const Icon = stage.icon
              const done = index <= currentIndex
              return (
                <div key={stage.status} className={`rounded-md border p-3 ${done ? "border-cavree-primary bg-cavree-primary/5" : "border-cavree-border"}`}>
                  <Icon size={18} className={done ? "text-cavree-primary" : "text-cavree-muted"} />
                  <p className="mt-2 text-sm font-medium">{stage.label}</p>
                </div>
              )
            })}
          </div>
        </div>
        <div className="rounded-lg border border-cavree-border bg-white">
          <div className="border-b border-cavree-border p-4 font-semibold">Items</div>
          <div className="divide-y divide-cavree-border">
            {order.items.map((item: any) => (
              <div key={item.id} className="p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-cavree-muted">{item.productCode} · {item.unitCount} units · {item.unitSize} pieces each</p>
                    <p className="mt-2 text-xs text-cavree-muted">{item.selectedUnitCodes.join(", ")}</p>
                  </div>
                  <p className="font-semibold">₹{item.total.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="rounded-lg border border-cavree-border bg-white p-5">
          <h3 className="font-playfair text-lg font-bold">Payment & Delivery</h3>
          <div className="mt-4 space-y-2 text-sm">
            <p><span className="text-cavree-muted">Payment:</span> {order.paymentStatus} via {order.paymentMethod || "Pending"}</p>
            <p><span className="text-cavree-muted">Subtotal:</span> ₹{order.subtotal.toLocaleString("en-IN")}</p>
            <p><span className="text-cavree-muted">GST:</span> ₹{order.tax.toLocaleString("en-IN")}</p>
            <p><span className="text-cavree-muted">Total:</span> ₹{order.total.toLocaleString("en-IN")}</p>
            <p><span className="text-cavree-muted">Deliver to:</span> {[order.deliveryName, order.deliveryCity, order.deliveryState].filter(Boolean).join(", ") || "Registered address"}</p>
          </div>
        </div>
        <div className="rounded-lg border border-cavree-border bg-white p-5">
          <h3 className="font-playfair text-lg font-bold">Timeline</h3>
          <div className="mt-4 space-y-4">
            {order.timeline.map((event: any) => (
              <div key={event.id} className="border-l-2 border-cavree-primary pl-3">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-cavree-muted">{new Date(event.createdAt).toLocaleString("en-IN")}</p>
                {event.note && <p className="mt-1 text-sm text-cavree-muted">{event.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
