"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, ChevronRight } from "lucide-react"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse border border-cavree-border rounded-lg p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-3" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border border-cavree-border rounded-lg">
        <Package size={48} className="mx-auto text-cavree-muted-light" />
        <h2 className="font-playfair text-xl font-bold mt-4">No Orders Yet</h2>
        <p className="text-cavree-muted mt-1 font-poppins text-sm">Start shopping to see your orders here.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 bg-cavree-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-cavree-primary-light transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border border-cavree-border rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-montserrat font-semibold">{order.orderNumber}</h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100"}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-cavree-muted font-poppins mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-montserrat font-semibold">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}
              </p>
              <Link
                href={`/account/orders/${order.id}`}
                className="flex items-center gap-1 text-sm text-cavree-primary hover:underline"
              >
                Details <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-cavree-border">
            <p className="text-sm font-medium mb-2 font-poppins">Items:</p>
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm font-poppins">
                  <span className="text-cavree-muted">{item.name} x {item.quantity}</span>
                  <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.total)}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-cavree-muted">+{order.items.length - 3} more items</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
