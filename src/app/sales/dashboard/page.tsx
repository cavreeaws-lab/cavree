"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BadgeIndianRupee, ClipboardList, PackageSearch, Users } from "lucide-react"

export default function SalesDashboardPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch("/api/sales/dashboard").then((res) => res.json()).then(setData) }, [])
  const stats = data?.stats || {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl font-bold">Sales Executive Dashboard</h2>
        <p className="text-sm text-cavree-muted">Assigned retailers, bulk orders, payments, and catalog visibility.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Retailers", stats.retailers || 0, Users],
          ["Recent Orders", stats.recentOrders || 0, ClipboardList],
          ["Order Value", `₹${(stats.revenue || 0).toLocaleString("en-IN")}`, BadgeIndianRupee],
          ["Catalog", stats.products || 0, PackageSearch],
        ].map(([label, value, Icon]: any) => (
          <div key={label} className="rounded-lg border border-cavree-border bg-white p-5">
            <div className="flex items-center justify-between"><p className="text-sm text-cavree-muted">{label}</p><Icon size={18} className="text-cavree-primary" /></div>
            <p className="mt-3 font-montserrat text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-cavree-border bg-white">
          <div className="border-b border-cavree-border p-4 font-semibold">My Retailers</div>
          {(data?.retailers || []).map((retailer: any) => (
            <Link key={retailer.id} href="/sales/retailers" className="block border-b border-cavree-border p-4 last:border-0 hover:bg-cavree-light">
              <p className="font-medium">{retailer.businessName}</p>
              <p className="text-sm text-cavree-muted">{retailer.ownerName} · {retailer.franchiseCode}</p>
            </Link>
          ))}
        </div>
        <div className="rounded-lg border border-cavree-border bg-white">
          <div className="border-b border-cavree-border p-4 font-semibold">Recent Orders</div>
          {(data?.orders || []).map((order: any) => (
            <Link key={order.id} href="/sales/orders" className="flex justify-between border-b border-cavree-border p-4 last:border-0 hover:bg-cavree-light">
              <span>{order.orderNumber}</span>
              <span className="font-semibold">₹{order.total.toLocaleString("en-IN")}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
