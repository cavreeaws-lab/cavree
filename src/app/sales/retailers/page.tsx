"use client"

import { useEffect, useState } from "react"

export default function SalesRetailersPage() {
  const [retailers, setRetailers] = useState<any[]>([])
  useEffect(() => { fetch("/api/sales/retailers").then((res) => res.json()).then((data) => setRetailers(data.retailers || [])) }, [])

  return (
    <div className="rounded-lg border border-cavree-border bg-white">
      <div className="border-b border-cavree-border p-4">
        <h2 className="font-playfair text-xl font-bold">My Retailers</h2>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {retailers.map((retailer) => (
          <div key={retailer.id} className="rounded-lg border border-cavree-border p-4">
            <p className="font-semibold">{retailer.businessName}</p>
            <p className="text-sm text-cavree-muted">{retailer.ownerName}</p>
            <div className="mt-3 space-y-1 text-sm">
              <p>Code: {retailer.franchiseCode}</p>
              <p>Phone: {retailer.phone}</p>
              <p>Status: {retailer.status}</p>
              <p>Orders: {retailer.bulkOrders?.length || 0}</p>
            </div>
          </div>
        ))}
        {retailers.length === 0 && <p className="p-6 text-sm text-cavree-muted">No retailers assigned yet.</p>}
      </div>
    </div>
  )
}
