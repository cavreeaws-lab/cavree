"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, ShoppingBag, CalendarDays, MapPin } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders/${orderNumber}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data.order)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [orderNumber])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={40} className="text-green-600" />
      </div>

      <h1 className="font-playfair text-3xl font-bold mt-6">Order Confirmed!</h1>
      <p className="text-cavree-muted mt-2 font-poppins">
        Thank you for your purchase. We have sent a confirmation email.
      </p>

      {order && (
        <div className="mt-8 bg-cavree-light border border-cavree-border rounded-lg p-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-cavree-muted font-poppins">Order Number</p>
              <p className="font-montserrat font-semibold text-lg">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-cavree-muted font-poppins">Total</p>
              <p className="font-montserrat font-semibold text-lg">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}
              </p>
            </div>
          </div>

          <div className="border-t border-cavree-border pt-4 space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm font-poppins">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.total)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-cavree-border pt-4 mt-4 space-y-2 text-sm text-cavree-muted font-poppins">
            <div className="flex items-center gap-2">
              <Package size={16} />
              <span>Status: <span className="font-medium text-cavree-foreground">{order.status}</span></span>
            </div>
            {order.address && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Delivering to: {order.address.city}, {order.address.state}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>Estimated delivery by {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        {order && (
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center justify-center gap-2 bg-cavree-primary text-white px-6 py-3 rounded-md font-medium hover:bg-cavree-primary-light transition-colors"
          >
            <Package size={18} />
            Track Order
          </Link>
        )}
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center gap-2 border border-cavree-border px-6 py-3 rounded-md font-medium hover:bg-cavree-light transition-colors"
        >
          <Package size={18} />
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 border border-cavree-border px-6 py-3 rounded-md font-medium hover:bg-cavree-light transition-colors"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
