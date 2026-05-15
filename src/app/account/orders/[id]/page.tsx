"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Package,
  ChevronLeft,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock size={16} />,
  CONFIRMED: <CheckCircle size={16} />,
  PROCESSING: <Clock size={16} />,
  SHIPPED: <Truck size={16} />,
  DELIVERED: <CheckCircle size={16} />,
  CANCELLED: <XCircle size={16} />,
  RETURNED: <AlertCircle size={16} />,
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load order")
        return res.json()
      })
      .then((data) => {
        setOrder(data.order)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load order details")
        setLoading(false)
      })
  }, [orderId])

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "PATCH" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel order")
      } else {
        toast.success("Order cancelled successfully")
        setOrder((prev: any) => ({ ...prev, status: "CANCELLED" }))
      }
    } catch {
      toast.error("Failed to cancel order")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3" />
        <div className="animate-pulse h-40 bg-gray-200 rounded" />
        <div className="animate-pulse h-40 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16 border border-cavree-border rounded-lg">
        <Package size={48} className="mx-auto text-cavree-muted-light" />
        <h2 className="font-playfair text-xl font-bold mt-4">Order Not Found</h2>
        <p className="text-cavree-muted mt-1 font-poppins text-sm">The order you are looking for does not exist.</p>
        <Link href="/account/orders" className="mt-6 inline-flex items-center gap-2 text-cavree-primary hover:underline font-medium">
          <ChevronLeft size={16} />
          Back to Orders
        </Link>
      </div>
    )
  }

  const canCancel = order.status === "PENDING"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-cavree-muted hover:text-cavree-primary mb-2">
            <ChevronLeft size={16} />
            Back to Orders
          </Link>
          <h2 className="font-playfair text-xl font-bold">{order.orderNumber}</h2>
          <p className="text-sm text-cavree-muted font-poppins">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
            {statusIcons[order.status]}
            {order.status}
          </span>
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-cavree-border">
          <h3 className="font-montserrat font-semibold text-sm">Order Items</h3>
        </div>
        <div className="divide-y divide-cavree-border">
          {order.items.map((item: any) => (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-md bg-cavree-light flex-shrink-0 overflow-hidden relative">
                <img
                  src={item.product?.images?.[0]?.url || "/images/placeholder.jpg"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-cavree-muted font-poppins">
                  {item.sku} {item.size && `· Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.price)}</p>
                <p className="text-xs text-cavree-muted font-poppins">Qty: {item.quantity}</p>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="text-sm font-semibold">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary & Shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary */}
        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-montserrat font-semibold text-sm mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm font-poppins">
            <div className="flex justify-between">
              <span className="text-cavree-muted">Subtotal</span>
              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-cavree-muted">Shipping</span>
              <span>{order.shipping === 0 ? "Free" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cavree-muted">Tax</span>
              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.tax)}</span>
            </div>
            <div className="pt-3 border-t border-cavree-border flex justify-between font-semibold">
              <span>Total</span>
              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-montserrat font-semibold text-sm mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-cavree-primary" />
            Shipping Address
          </h3>
          <div className="text-sm font-poppins space-y-1">
            <p className="font-medium">{order.address?.name}</p>
            <p className="text-cavree-muted">{order.address?.address}</p>
            <p className="text-cavree-muted">{order.address?.city}, {order.address?.state} {order.address?.pincode}</p>
            <p className="text-cavree-muted">{order.address?.country}</p>
            <p className="text-cavree-muted mt-2">Phone: {order.address?.phone}</p>
          </div>
        </div>

        {/* Payment & Shipping */}
        <div className="bg-white border border-cavree-border rounded-lg p-6 space-y-6">
          <div>
            <h3 className="font-montserrat font-semibold text-sm mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-cavree-primary" />
              Payment
            </h3>
            <div className="text-sm font-poppins space-y-1">
              <p><span className="text-cavree-muted">Method:</span> {order.payment?.method || "COD"}</p>
              <p><span className="text-cavree-muted">Status:</span> {order.payment?.status || "PENDING"}</p>
              {order.payment?.transactionId && (
                <p className="text-xs text-cavree-muted break-all">Txn: {order.payment.transactionId}</p>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-cavree-border">
            <h3 className="font-montserrat font-semibold text-sm mb-3 flex items-center gap-2">
              <Truck size={16} className="text-cavree-primary" />
              Shipping
            </h3>
            <div className="text-sm font-poppins space-y-1">
              <p><span className="text-cavree-muted">Status:</span> {order.shippingDetail?.status || "PENDING"}</p>
              {order.shippingDetail?.carrier && (
                <p><span className="text-cavree-muted">Carrier:</span> {order.shippingDetail.carrier}</p>
              )}
              {order.shippingDetail?.trackingNumber && (
                <p><span className="text-cavree-muted">Tracking:</span> {order.shippingDetail.trackingNumber}</p>
              )}
              {order.shippingDetail?.trackingUrl && (
                <a href={order.shippingDetail.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-cavree-primary hover:underline text-xs">
                  Track Shipment
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
