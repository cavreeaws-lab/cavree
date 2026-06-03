"use client"

import { useEffect, useState } from "react"

export default function SalesPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  useEffect(() => { fetch("/api/sales/payments").then((res) => res.json()).then((data) => setPayments(data.payments || [])) }, [])

  return (
    <div className="rounded-lg border border-cavree-border bg-white">
      <div className="border-b border-cavree-border p-4">
        <h2 className="font-playfair text-xl font-bold">Payments</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cavree-light text-left text-xs uppercase text-cavree-muted">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Retailer</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-cavree-border">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-3 font-medium">{payment.orderNumber}</td>
                <td className="px-4 py-3">{payment.retailer?.businessName || payment.franchiseCode}</td>
                <td className="px-4 py-3">{payment.paymentMethod || "Pending"}</td>
                <td className="px-4 py-3">{payment.paymentStatus}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{payment.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-cavree-muted">No payments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
