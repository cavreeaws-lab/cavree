"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { ArrowRight, Grid2X2, List, Search, ShoppingCart } from "lucide-react"

const categories = ["ALL", "Women", "Men", "Kids"]
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "stock", label: "Most Available" },
]

export default function FranchiseStorePage() {
  const [products, setProducts] = useState<any[]>([])
  const [category, setCategory] = useState("ALL")
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sort, setSort] = useState("featured")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (category !== "ALL") params.set("category", category)
    if (search) params.set("search", search)
    fetch(`/api/franchise/bulk-products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false))
  }, [category, search])

  const sortedProducts = useMemo(() => {
    const list = [...products]
    if (sort === "price-low") return list.sort((a, b) => a.wholesalePrice - b.wholesalePrice)
    if (sort === "price-high") return list.sort((a, b) => b.wholesalePrice - a.wholesalePrice)
    if (sort === "stock") return list.sort((a, b) => b.availableUnits - a.availableUnits)
    return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
  }, [products, sort])

  const addToCart = async (productId: string, minUnits: number) => {
    const res = await fetch("/api/franchise/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, unitCount: minUnits }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Could not add product")
      return
    }
    toast.success("Added to bulk cart")
  }

  const layoutClass = useMemo(
    () => view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3",
    [view]
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-playfair text-2xl font-bold">Franchise Bulk Store</h2>
          <p className="text-sm text-cavree-muted">Wholesale products with unit-based ordering.</p>
        </div>
        <Link href="/franchise/cart" className="inline-flex items-center gap-2 rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white">
          <ShoppingCart size={16} /> View Cart
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-cavree-border bg-white p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product ID or name" className="w-full rounded-md border border-cavree-border py-2 pl-9 pr-3 text-sm outline-none focus:border-cavree-primary" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`rounded-md px-3 py-2 text-sm ${category === item ? "bg-cavree-primary text-white" : "bg-cavree-light"}`}>{item}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-cavree-border bg-white px-3 py-2 text-sm">
          {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <div className="flex gap-1">
          <button onClick={() => setView("grid")} className={`rounded-md border p-2 ${view === "grid" ? "border-cavree-primary text-cavree-primary" : "border-cavree-border"}`}><Grid2X2 size={16} /></button>
          <button onClick={() => setView("list")} className={`rounded-md border p-2 ${view === "list" ? "border-cavree-primary text-cavree-primary" : "border-cavree-border"}`}><List size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-lg border border-cavree-border bg-white" />
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cavree-border bg-white p-12 text-center">
          <h3 className="font-playfair text-xl font-bold">Bulk catalog coming soon</h3>
          <p className="mt-2 text-sm text-cavree-muted">Admin can add wholesale products from the bulk product endpoint.</p>
        </div>
      ) : (
        <div className={layoutClass}>
          {sortedProducts.map((product) => (
            <div key={product.id} className={`rounded-lg border border-cavree-border bg-white p-4 ${view === "list" ? "flex gap-4" : ""}`}>
              <Link href={`/franchise/store/${product.slug || product.id}`} className={`relative block overflow-hidden rounded-md bg-cavree-light ${view === "list" ? "h-28 w-24 shrink-0" : "aspect-[3/4]"}`}>
                {product.image ? <Image src={product.image} alt={product.name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-cavree-muted">No image</div>}
              </Link>
              <div className="mt-3 min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-cavree-muted">{product.productId} · {product.category}</p>
                    <Link href={`/franchise/store/${product.slug || product.id}`} className="font-montserrat font-semibold hover:text-cavree-primary">{product.name}</Link>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${product.availableUnits > product.minUnits ? "bg-green-50 text-green-700" : product.availableUnits > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{product.availableUnits} units</span>
                </div>
                <p className="mt-2 text-sm text-cavree-muted">1 unit = {product.unitSize.toLocaleString("en-IN")} pieces · Min {product.minUnits}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">₹{product.wholesalePrice.toLocaleString("en-IN")} / unit</p>
                    <p className="text-xs text-cavree-muted">Single piece ₹{product.singlePiecePrice.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/franchise/store/${product.slug || product.id}`} className="inline-flex items-center gap-1 rounded-md border border-cavree-border px-3 py-2 text-sm font-medium hover:bg-cavree-light">View <ArrowRight size={14} /></Link>
                    <button onClick={() => addToCart(product.id, product.minUnits)} className="rounded-md bg-cavree-primary px-3 py-2 text-sm font-medium text-white">Add</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
