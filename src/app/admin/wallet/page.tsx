"use client"

import { useEffect, useState } from "react"
import { CreditCard, IndianRupee, Package, Wallet } from "lucide-react"
import toast from "react-hot-toast"

export default function FranchiseWalletPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/orders?limit=100")
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

  const grossSales = orders
    .filter((order) => !["CANCELLED", "RETURNED"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0)
  const completedPayments = orders
    .filter((order) => order.payment?.status === "COMPLETED")
    .reduce((sum, order) => sum + order.total, 0)
  const pendingPayments = orders
    .filter((order) => order.payment?.status === "PENDING")
    .reduce((sum, order) => sum + order.total, 0)
  const commissionRate = (orders[0]?.franchise?.commission ?? 10) / 100
  const estimatedCommission = grossSales * commissionRate

  const cards = [
    { label: "Gross Sales", value: grossSales, icon: IndianRupee },
    { label: "Completed Payments", value: completedPayments, icon: CreditCard },
    { label: "Pending Payments", value: pendingPayments, icon: Package },
    { label: "Estimated Commission", value: estimatedCommission, icon: Wallet },
  ]

  if (loading) {
    return <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Franchise Wallet</h2>
        <p className="text-sm text-cavree-muted font-poppins mt-1">Track franchise order payments and estimated commission.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-cavree-border rounded-lg p-5">
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

      <div className="bg-white border border-cavree-border rounded-lg">
        <div className="px-6 py-4 border-b border-cavree-border">
          <h3 className="font-playfair text-lg font-bold">Wallet Activity</h3>
        </div>
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-cavree-muted font-poppins">No wallet activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cavree-light">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Order</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Payment</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cavree-border">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-sm font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm font-poppins">{order.payment?.method || "-"}</td>
                    <td className="px-6 py-4 text-sm font-poppins">{order.payment?.status || "PENDING"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-right">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
