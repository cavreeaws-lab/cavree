"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Package, Truck, MapPin, CheckCircle, Clock, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

const statusSteps = [
  { label: "Order Placed", icon: Package },
  { label: "Order Confirmed", icon: CheckCircle },
  { label: "Shipped", icon: Truck },
  { label: "Out for Delivery", icon: MapPin },
  { label: "Delivered", icon: CheckCircle },
]

const statusIndex: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  RETURNED: -1,
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true)
    setSearched(false)
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Order not found")
        setOrder(null)
      } else {
        setOrder(data.order)
      }
      setSearched(true)
    } catch {
      toast.error("Failed to track order")
      setSearched(true)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? statusIndex[order.status] ?? 0 : 0
  const isCancelled = order?.status === "CANCELLED"
  const isDelivered = order?.status === "DELIVERED"
  const estimatedDate = order
    ? new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
    : ""

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">Track Your Order</h1>
        <p className="mt-4 text-cavree-muted font-poppins max-w-xl mx-auto">
          Enter your order number below to see the current status of your shipment.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-12">
        <div className="flex-1 relative">
          <Package size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input
            type="text"
            placeholder="Enter order number (e.g., CAV-123456)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-cavree-border rounded-md text-sm font-poppins outline-none focus:border-cavree-primary transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-cavree-primary hover:bg-cavree-primary-light disabled:opacity-60 text-white px-6 py-3 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
        >
          {loading ? (
            <>
              <Clock size={16} className="animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search size={16} />
              Track Order
            </>
          )}
        </button>
      </form>

      {searched && order && (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-cavree-border rounded-lg">
            <div>
              <p className="text-xs text-cavree-muted font-poppins uppercase tracking-wide">Order Number</p>
              <p className="font-montserrat font-semibold text-lg">{order.orderNumber}</p>
            </div>
            <div className="flex gap-6 flex-wrap">
              <div>
                <p className="text-xs text-cavree-muted font-poppins uppercase tracking-wide">Order Date</p>
                <p className="font-montserrat font-medium text-sm">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs text-cavree-muted font-poppins uppercase tracking-wide">Expected Delivery</p>
                <p className="font-montserrat font-medium text-sm">{estimatedDate}</p>
              </div>
              <div>
                <p className="text-xs text-cavree-muted font-poppins uppercase tracking-wide">Status</p>
                <p className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-montserrat ${isCancelled ? "bg-red-50 text-red-700" : isDelivered ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {isCancelled ? <AlertCircle size={12} /> : <MapPin size={12} />}
                  {order.status.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>

          {!isCancelled && (
            <div className="border border-cavree-border rounded-lg p-6 md:p-8">
              <h2 className="font-montserrat font-semibold text-lg mb-6">Shipment Progress</h2>
              <div className="relative">
                {statusSteps.map((step, i) => {
                  const isLast = i === statusSteps.length - 1
                  const completed = i <= currentStep
                  return (
                    <div key={step.label} className="relative pl-10 pb-8 last:pb-0">
                      {!isLast && (
                        <div className={`absolute left-[18px] top-8 w-0.5 h-[calc(100%-24px)] ${completed ? "bg-cavree-primary" : "bg-cavree-border"}`} />
                      )}
                      <div className={`absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center ${completed ? "bg-cavree-primary text-white" : "bg-cavree-light text-cavree-muted border border-cavree-border"}`}>
                        <step.icon size={16} />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div>
                          <p className="font-montserrat font-medium text-sm">{step.label}</p>
                          {completed && i === currentStep && (
                            <p className="text-xs text-cavree-muted font-poppins mt-0.5">{new Date().toLocaleDateString("en-IN")}</p>
                          )}
                        </div>
                        {completed && <span className="text-xs text-green-600 font-medium font-poppins">Completed</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {order.items && order.items.length > 0 && (
            <div className="border border-cavree-border rounded-lg p-5">
              <h3 className="font-playfair text-base font-bold mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-cavree-light flex-shrink-0">
                      <Image src={item.product?.images?.[0]?.url || "/images/placeholder.jpg"} alt={item.product?.name || ""} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product?.name}</p>
                      <p className="text-xs text-cavree-muted font-poppins">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.address && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-cavree-border rounded-lg p-5">
                <p className="text-xs text-cavree-muted font-poppins uppercase tracking-wide mb-1">Shipping Address</p>
                <p className="font-montserrat font-medium text-sm">{order.address.name}</p>
                <p className="text-xs text-cavree-muted font-poppins mt-1 leading-relaxed">{order.address.address}, {order.address.city}, {order.address.state} — {order.address.pincode}</p>
                <p className="text-xs text-cavree-muted font-poppins">{order.address.phone}</p>
              </div>
              <div className="border border-cavree-border rounded-lg p-5">
                <p className="text-xs text-cavree-muted font-poppins uppercase tracking-wide mb-1">Payment</p>
                <p className="font-montserrat font-medium text-sm">{order.payment?.method || "COD"}</p>
                <p className="text-xs text-cavree-muted font-poppins mt-1">Status: {order.payment?.status || "PENDING"}</p>
                <p className="text-sm font-medium mt-2">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {searched && !order && (
        <div className="text-center p-8 bg-cavree-light rounded-lg">
          <AlertCircle size={40} className="mx-auto text-cavree-muted mb-3" />
          <h3 className="font-montserrat font-semibold mb-2">Order Not Found</h3>
          <p className="text-sm text-cavree-muted font-poppins mb-4">
            We couldn&apos;t find an order with that number. Please check and try again.
          </p>
        </div>
      )}

      {!searched && (
        <div className="text-center p-8 bg-cavree-light rounded-lg">
          <h3 className="font-montserrat font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-cavree-muted font-poppins mb-4">
            You can find your order number in the confirmation email or SMS sent after purchase.
          </p>
          <Link
            href="mailto:support@cavree.com"
            className="inline-flex items-center gap-2 bg-cavree-primary hover:bg-cavree-primary-light text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors"
          >
            Contact Support
          </Link>
        </div>
      )}
    </div>
  )
}
