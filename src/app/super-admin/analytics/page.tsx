"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function SuperAdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/super-admin/analytics")
      .then((res) => res.json())
      .then((data) => { setData(data); setLoading(false) })
      .catch(() => { toast.error("Failed to load analytics"); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Analytics</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  const cards = [
    { label: "Total Users", value: data?.totalUsers ?? 0 },
    { label: "Total Orders", value: data?.totalOrders ?? 0 },
    { label: "Total Revenue", value: `₹${(data?.totalRevenue ?? 0).toLocaleString("en-IN")}` },
    { label: "Total Franchises", value: data?.totalFranchises ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-xl font-bold">Analytics</h2>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-cavree-border rounded-lg p-4">
            <p className="text-xs text-cavree-muted font-poppins uppercase">{card.label}</p>
            <p className="text-2xl font-bold font-playfair mt-1">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-playfair text-lg font-bold mb-4">Top Products</h3>
          {data?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-cavree-light rounded-full h-2"><div className="bg-cavree-primary h-2 rounded-full" style={{ width: `${Math.min((p.sales / (data.topProducts[0].sales || 1)) * 100, 100)}%` }} /></div>
                    <span className="text-sm font-poppins">{p.sales}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cavree-muted text-sm">No data yet.</p>
          )}
        </div>
        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-playfair text-lg font-bold mb-4">Revenue by Month</h3>
          {data?.revenueByMonth?.length > 0 ? (
            <div className="space-y-3">
              {data.revenueByMonth.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{m.month}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-cavree-light rounded-full h-2"><div className="bg-cavree-primary h-2 rounded-full" style={{ width: `${Math.min((m.revenue / (data.revenueByMonth[0].revenue || 1)) * 100, 100)}%` }} /></div>
                    <span className="text-sm font-poppins">₹{(m.revenue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cavree-muted text-sm">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
