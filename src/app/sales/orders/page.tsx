"use client"

import { useEffect, useState } from "react"

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  useEffect(() => { fetch("/api/sales/orders").then((res) => res.json()).then((data) => setOrders(data.orders || [])) }, [])

  return (
    <div className="rounded-lg border border-cavree-border bg-white">
      <div className="border-b border-cavree-border p-4">
        <h2 className="font-playfair text-xl font-bold">Retailer Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cavree-light text-left text-xs uppercase text-cavree-muted">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Retailer</th><th className="px-4 py-3">Units</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-cavree-border">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.retailer?.businessName || order.franchiseCode}</td>
                <td className="px-4 py-3">{order.totalUnits}</td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{order.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-cavree-muted">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
