"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load customers")
        setLoading(false)
      })
  }, [])
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-xl font-bold">Customers</h2>

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Phone</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Orders</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-cavree-light/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{customer.email}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm text-right font-poppins">{customer.orders}</td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(customer.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
