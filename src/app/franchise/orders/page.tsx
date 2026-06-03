"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function FranchiseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/franchise/orders").then((res) => res.json()).then((data) => setOrders(data.orders || []))
  }, [])

  return (
    <div className="rounded-lg border border-cavree-border bg-white">
      <div className="border-b border-cavree-border p-4">
        <h2 className="font-playfair text-xl font-bold">Bulk Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cavree-light text-left text-xs uppercase text-cavree-muted">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Units</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-cavree-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-cavree-light/60">
                <td className="px-4 py-3"><Link href={`/franchise/orders/${order.id}`} className="font-medium text-cavree-primary">{order.orderNumber}</Link></td>
                <td className="px-4 py-3">{order.totalUnits} / {order.totalPieces?.toLocaleString("en-IN")} pcs</td>
                <td className="px-4 py-3">{order.paymentStatus}</td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{order.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-cavree-muted">No bulk orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
