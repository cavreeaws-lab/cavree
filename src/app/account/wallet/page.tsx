"use client"

import { useEffect, useState } from "react"
import { CreditCard, Package, RotateCcw, Wallet } from "lucide-react"
import toast from "react-hot-toast"

export default function CustomerWalletPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load wallet")
        setLoading(false)
      })
  }, [])

  const paidAmount = orders
    .filter((order) => order.payment?.status === "COMPLETED")
    .reduce((sum, order) => sum + order.total, 0)
  const pendingAmount = orders
    .filter((order) => order.payment?.status === "PENDING")
    .reduce((sum, order) => sum + order.total, 0)
  const refundedAmount = orders
    .filter((order) => order.status === "CANCELLED" && order.payment?.status === "REFUNDED")
    .reduce((sum, order) => sum + order.total, 0)

  const cards = [
    { label: "Wallet Balance", value: 0, icon: Wallet },
    { label: "Paid Orders", value: paidAmount, icon: CreditCard },
    { label: "Pending Payments", value: pendingAmount, icon: Package },
    { label: "Refunded", value: refundedAmount, icon: RotateCcw },
  ]

  if (loading) {
    return <div className="animate-pulse border border-cavree-border rounded-lg h-64" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Wallet</h2>
        <p className="text-sm text-cavree-muted font-poppins mt-1">Track your payments, refunds, and order wallet activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-cavree-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cavree-muted font-poppins">{card.label}</p>
                <p className="font-montserrat text-2xl font-bold mt-1">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(card.value)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center">
                <card.icon size={20} className="text-cavree-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-cavree-border rounded-lg p-5">
        <h3 className="font-playfair text-lg font-bold mb-3">Recent Wallet Activity</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-cavree-muted font-poppins">No wallet activity yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm font-poppins border-b border-cavree-border last:border-b-0 pb-3 last:pb-0">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-cavree-muted">{order.payment?.method || "Payment"} · {order.payment?.status || "PENDING"}</p>
                </div>
                <p className="font-medium">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
