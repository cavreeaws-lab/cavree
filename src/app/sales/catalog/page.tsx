"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export default function SalesCatalogPage() {
  const [products, setProducts] = useState<any[]>([])
  useEffect(() => { fetch("/api/sales/catalog").then((res) => res.json()).then((data) => setProducts(data.products || [])) }, [])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-playfair text-2xl font-bold">Product Catalog</h2>
        <p className="text-sm text-cavree-muted">Read-only wholesale catalog for retailer conversations.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-lg border border-cavree-border bg-white p-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-cavree-light">
              {product.image ? <Image src={product.image} alt={product.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-cavree-muted">No image</div>}
            </div>
            <p className="mt-3 text-xs text-cavree-muted">{product.productId} · {product.category}</p>
            <h3 className="font-medium">{product.name}</h3>
            <p className="mt-2 text-sm">₹{product.wholesalePrice.toLocaleString("en-IN")} / unit</p>
            <p className="text-xs text-cavree-muted">{product.availableUnits} units available</p>
          </div>
        ))}
        {products.length === 0 && <div className="rounded-lg border border-dashed border-cavree-border bg-white p-10 text-center text-sm text-cavree-muted sm:col-span-2 xl:col-span-4">No wholesale catalog products yet.</div>}
      </div>
    </div>
  )
}
