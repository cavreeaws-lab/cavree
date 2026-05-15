"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, Package, Users, IndianRupee, TrendingUp, TrendingDown } from "lucide-react"
import toast from "react-hot-toast"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load dashboard")
        setLoading(false)
      })
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-cavree-border rounded-lg p-5 h-28" />
          ))}
        </div>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  const stats = [
    { label: "Total Orders", value: data.stats.totalOrders.toLocaleString("en-IN"), change: "+12%", trend: "up", icon: ShoppingCart },
    { label: "Total Products", value: data.stats.totalProducts.toLocaleString("en-IN"), change: "+5%", trend: "up", icon: Package },
    { label: "Total Customers", value: data.stats.totalCustomers.toLocaleString("en-IN"), change: "+8%", trend: "up", icon: Users },
    { label: "Revenue", value: `₹${(data.stats.totalRevenue / 100000).toFixed(1)}L`, change: "-3%", trend: "down", icon: IndianRupee },
  ]

  const recentOrders = data.recentOrders || []
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-cavree-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cavree-muted font-poppins">{stat.label}</p>
                <p className="font-montserrat text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center">
                <stat.icon size={20} className="text-cavree-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.trend === "up" ? (
                <TrendingUp size={14} className="text-green-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change}
              </span>
              <span className="text-xs text-cavree-muted font-poppins">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-cavree-border rounded-lg">
        <div className="px-6 py-4 border-b border-cavree-border flex items-center justify-between">
          <h2 className="font-playfair text-lg font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-cavree-primary hover:underline font-poppins">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-cavree-light/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{order.user?.name || "Guest"}</td>
                  <td className="px-6 py-4 text-sm text-cavree-muted font-poppins">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.total)}
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
