"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, MapPin, CreditCard, Truck, Package, Printer, FileText, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"]
const timeline = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [tracking, setTracking] = useState({ carrier: "", trackingNumber: "", trackingUrl: "", estimatedDate: "" })

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load order")
        return res.json()
      })
      .then((data) => {
        setOrder(data.order)
        setStatus(data.order.status)
        setTracking({
          carrier: data.order.shippingDetail?.carrier || "",
          trackingNumber: data.order.shippingDetail?.trackingNumber || "",
          trackingUrl: data.order.shippingDetail?.trackingUrl || "",
          estimatedDate: data.order.shippingDetail?.estimatedDate?.slice(0, 10) || "",
        })
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load order details")
        setLoading(false)
      })
  }, [orderId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3" />
        <div className="animate-pulse h-40 bg-gray-200 rounded" />
      </div>
    )
  }

  const updateOrder = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          carrier: tracking.carrier || undefined,
          trackingNumber: tracking.trackingNumber || undefined,
          trackingUrl: tracking.trackingUrl || undefined,
          estimatedDate: tracking.estimatedDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setOrder((prev: any) => ({ ...prev, ...data.order }))
      toast.success("Order updated")
    } catch {
      toast.error("Failed to update order")
    } finally {
      setSaving(false)
    }
  }

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`)
      const data = await res.json()
      if (!res.ok) throw new Error()
      toast.success(`Invoice ready: ${data.invoice.invoiceNumber}`)
      window.print()
    } catch {
      toast.error("Failed to prepare invoice")
    }
  }

  if (!order) {
    return (
      <div className="text-center py-16 border border-cavree-border rounded-lg">
        <Package size={48} className="mx-auto text-cavree-muted-light" />
        <h2 className="font-playfair text-xl font-bold mt-4">Order Not Found</h2>
        <Link href="/admin/orders" className="mt-6 inline-flex items-center gap-1 text-cavree-primary hover:underline font-medium">
          <ChevronLeft size={16} />
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-cavree-muted hover:text-cavree-primary mb-2">
          <ChevronLeft size={16} />
          Back to Orders
        </Link>
        <h2 className="font-playfair text-xl font-bold">{order.orderNumber}</h2>
        <p className="text-sm text-cavree-muted font-poppins">
          Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
        </p>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg p-6 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-5">
            <label className="block">
              <span className="text-xs text-cavree-muted font-poppins">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 text-sm">
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-cavree-muted font-poppins">Carrier</span>
              <input value={tracking.carrier} onChange={(e) => setTracking((prev) => ({ ...prev, carrier: e.target.value }))} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-cavree-muted font-poppins">Tracking number</span>
              <input value={tracking.trackingNumber} onChange={(e) => setTracking((prev) => ({ ...prev, trackingNumber: e.target.value }))} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-cavree-muted font-poppins">Tracking URL</span>
              <input value={tracking.trackingUrl} onChange={(e) => setTracking((prev) => ({ ...prev, trackingUrl: e.target.value }))} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-cavree-muted font-poppins">ETA</span>
              <input type="date" value={tracking.estimatedDate} onChange={(e) => setTracking((prev) => ({ ...prev, estimatedDate: e.target.value }))} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchInvoice} className="inline-flex items-center gap-2 rounded-md border border-cavree-border px-4 py-2 text-sm font-medium hover:bg-cavree-light"><Printer size={16} /> Invoice</button>
            <button onClick={updateOrder} disabled={saving} className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg p-6">
        <h3 className="font-montserrat font-semibold text-sm mb-4 flex items-center gap-2"><FileText size={16} className="text-cavree-primary" />Status Timeline</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {timeline.map((item, index) => {
            const currentIndex = timeline.indexOf(order.status)
            const complete = currentIndex >= index || order.status === "DELIVERED"
            return (
              <div key={item} className={`rounded-lg border p-3 ${complete ? "border-cavree-primary bg-cavree-primary/5" : "border-cavree-border"}`}>
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${complete ? "bg-cavree-primary text-white" : "bg-cavree-light text-cavree-muted"}`}>
                  <CheckCircle size={16} />
                </div>
                <p className="text-sm font-medium">{item.replace(/_/g, " ")}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-montserrat font-semibold text-sm mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm font-poppins">
            <div className="flex justify-between"><span className="text-cavree-muted">Subtotal</span><span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-cavree-muted">Shipping</span><span>{order.shipping === 0 ? "Free" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.shipping)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.discount)}</span></div>}
            <div className="pt-3 border-t border-cavree-border flex justify-between font-semibold"><span>Total</span><span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}</span></div>
          </div>
        </div>

        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-montserrat font-semibold text-sm mb-4 flex items-center gap-2"><MapPin size={16} className="text-cavree-primary" />Shipping Address</h3>
          <div className="text-sm font-poppins space-y-1">
            <p className="font-medium">{order.address?.name}</p>
            <p className="text-cavree-muted">{order.address?.address}</p>
            <p className="text-cavree-muted">{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
            <p className="text-cavree-muted">{order.address?.country}</p>
            <p className="text-cavree-muted mt-1">{order.address?.phone}</p>
          </div>
        </div>

        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-montserrat font-semibold text-sm mb-4 flex items-center gap-2"><CreditCard size={16} className="text-cavree-primary" />Payment</h3>
          <div className="text-sm font-poppins space-y-1">
            <p><span className="text-cavree-muted">Method:</span> {order.payment?.method}</p>
            <p><span className="text-cavree-muted">Status:</span> {order.payment?.status}</p>
            <p><span className="text-cavree-muted">Amount:</span> {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.payment?.amount || 0)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg p-6">
        <h3 className="font-montserrat font-semibold text-sm mb-4 flex items-center gap-2"><Truck size={16} className="text-cavree-primary" />Shipping Tracking</h3>
        <div className="grid gap-3 text-sm font-poppins md:grid-cols-4">
          <p><span className="text-cavree-muted">Carrier:</span> {order.shippingDetail?.carrier || "-"}</p>
          <p><span className="text-cavree-muted">Tracking:</span> {order.shippingDetail?.trackingNumber || "-"}</p>
          <p><span className="text-cavree-muted">Status:</span> {order.shippingDetail?.status || "PENDING"}</p>
          <p><span className="text-cavree-muted">ETA:</span> {order.shippingDetail?.estimatedDate ? new Date(order.shippingDetail.estimatedDate).toLocaleDateString("en-IN") : "-"}</p>
        </div>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-cavree-border"><h3 className="font-montserrat font-semibold text-sm">Order Items</h3></div>
        <div className="divide-y divide-cavree-border">
          {order.items?.map((item: any) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between text-sm font-poppins">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-cavree-muted text-xs">{item.sku} {item.size && `· Size: ${item.size}`} {item.color && `· Color: ${item.color}`}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.total)}</p>
                <p className="text-cavree-muted text-xs">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
