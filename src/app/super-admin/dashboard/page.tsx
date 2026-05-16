"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Store, ShoppingCart, Package, Users, IndianRupee, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#fbbf24",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#a855f7",
  SHIPPED: "#6366f1",
  DELIVERED: "#22c55e",
  CANCELLED: "#ef4444",
}

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ordersData, setOrdersData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/super-admin/analytics")
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { toast.error("Failed to load analytics"); setLoading(false) })
  }, [])

  useEffect(() => {
    fetch("/api/super-admin/orders")
      .then((res) => res.json())
      .then((d) => setOrdersData(d))
      .catch(() => {})
  }, [])

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white border border-cavree-border rounded-lg p-5 h-28" />
        ))}
      </div>
    )
  }

  const s = data.stats
  const stats = [
    { label: "Total Franchises", value: s.totalFranchises.toLocaleString("en-IN"), change: "+3", icon: Store },
    { label: "Total Orders", value: s.totalOrders.toLocaleString("en-IN"), change: "+18%", icon: ShoppingCart },
    { label: "Total Products", value: s.totalProducts.toLocaleString("en-IN"), change: "+12%", icon: Package },
    { label: "Total Users", value: s.totalUsers.toLocaleString("en-IN"), change: "+25%", icon: Users },
    { label: "Platform Revenue", value: `₹${(s.totalRevenue / 10000000).toFixed(1)}Cr`, change: "+15%", icon: IndianRupee },
  ]
  const topFranchises = data.topFranchises || []

  const statusData = useMemo(() => {
    const orders = ordersData?.orders || []
    const counts: Record<string, number> = {}
    orders.forEach((o: any) => {
      counts[o.status] = (counts[o.status] || 0) + 1
    })
    return ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => ({
      name: status,
      value: counts[status] || 0,
    }))
  }, [ordersData])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs font-medium text-green-600">{stat.change}</span>
              <span className="text-xs text-cavree-muted font-poppins">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-playfair text-base font-bold mb-4">Revenue by Franchise</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFranchises}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString("en-IN")}`} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-playfair text-base font-bold mb-4">Orders by Status</h3>
          <div className="h-64">
            {ordersData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [`${v} orders`, n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-cavree-muted">
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Franchises */}
      <div className="bg-white border border-cavree-border rounded-lg">
        <div className="px-6 py-4 border-b border-cavree-border flex items-center justify-between">
          <h2 className="font-playfair text-lg font-bold">Top Franchises</h2>
          <Link href="/super-admin/franchises" className="text-sm text-cavree-primary hover:underline font-poppins">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Franchise</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Revenue</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Orders</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {topFranchises.map((franchise: any) => (
                <tr key={franchise.name} className="hover:bg-cavree-light/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium font-poppins">{franchise.name}</td>
                  <td className="px-6 py-4 text-sm text-right font-poppins">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(franchise.revenue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-poppins">{franchise.orders}</td>
                  <td className="px-6 py-4 text-sm text-right font-poppins">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(franchise.commission)}
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
