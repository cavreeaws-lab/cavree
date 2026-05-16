"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, MapPin, CreditCard, Truck, Package } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3" />
        <div className="animate-pulse h-40 bg-gray-200 rounded" />
      </div>
    )
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
