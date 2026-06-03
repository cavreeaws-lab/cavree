"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Search, Store, MapPin, Phone, Mail, RefreshCw, Grid3X3, LayoutList, ChevronDown } from "lucide-react"
import { PriceDisplay } from "@/components/PriceDisplay"
import ProductCardAddToCart from "@/components/ProductCardAddToCart"

export default function FranchisePublicStorePage() {
  const params = useParams()
  const franchiseSlug = params.franchiseSlug as string

  const [franchise, setFranchise] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const [category, setCategory] = useState("ALL")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 12

  const fetchData = async (isRefresh = false) => {
    if (!franchiseSlug) return
    if (isRefresh) setRefreshing(true)
    else if (page === 1) setLoading(true)

    const params = new URLSearchParams()
    if (category !== "ALL") params.set("category", category)
    if (search) params.set("search", search)
    params.set("sort", sort)
    params.set("page", String(page))
    params.set("limit", String(limit))

    try {
      const res = await fetch(`/api/franchise/public-store/${franchiseSlug}?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to load store")
        setFranchise(null)
        setProducts([])
      } else {
        setError("")
        setFranchise(data.franchise)
        setCategories(data.categories || [])
        const newProducts = data.products || []
        setProducts((prev) => (page === 1 ? newProducts : [...prev, ...newProducts]))
        setTotal(data.total || 0)
        setHasMore(page * limit < (data.total || 0) && newProducts.length > 0)
      }
    } catch {
      setError("Failed to load store")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load + filter/sort/page changes
  useEffect(() => {
    setPage(1)
    setProducts([])
  }, [category, search, sort])

  useEffect(() => {
    fetchData()
  }, [franchiseSlug, category, search, sort, page])

  // Real-time polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!franchiseSlug) return
      const params = new URLSearchParams()
      if (category !== "ALL") params.set("category", category)
      if (search) params.set("search", search)
      params.set("sort", sort)
      params.set("page", "1")
      params.set("limit", String(Math.max(products.length, limit)))

      fetch(`/api/franchise/public-store/${franchiseSlug}?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.franchise) {
            setFranchise(data.franchise)
            setCategories(data.categories || [])
            // Only replace products if count changed or first page
            if (data.products?.length !== products.length || page === 1) {
              setProducts(data.products || [])
              setTotal(data.total || 0)
            }
          }
        })
        .catch(() => {})
    }, 10000)

    return () => clearInterval(interval)
  }, [franchiseSlug, category, search, sort, products.length, page])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (category !== "ALL") count++
    if (search) count++
    return count
  }, [category, search])

  const clearFilters = () => {
    setCategory("ALL")
    setSearch("")
    setSort("newest")
    setPage(1)
  }

  if (error && !franchise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store size={48} className="mx-auto text-cavree-muted" />
          <h1 className="mt-4 font-playfair text-2xl font-bold">Store Not Found</h1>
          <p className="mt-2 text-cavree-muted">{error}</p>
          <Link href="/" className="mt-6 inline-block rounded-md bg-cavree-primary px-6 py-2 text-sm font-medium text-white">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Franchise Header */}
      {franchise && (
        <div className="relative bg-cavree-dark text-white">
          {franchise.banner ? (
            <div className="absolute inset-0">
              <Image src={franchise.banner} alt={franchise.name} fill className="object-cover opacity-30" />
            </div>
          ) : null}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {franchise.logo ? (
                <div className="relative h-20 w-20 rounded-full border-4 border-white bg-white overflow-hidden shrink-0">
                  <Image src={franchise.logo} alt={franchise.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-cavree-primary shrink-0">
                  <Store size={32} className="text-white" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="font-playfair text-3xl md:text-4xl font-bold">{franchise.name}</h1>
                {franchise.description && (
                  <p className="mt-2 text-white/80 max-w-2xl">{franchise.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
                  {franchise.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} /> {franchise.city}{franchise.state ? `, ${franchise.state}` : ""}
                    </span>
                  )}
                  {franchise.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} /> {franchise.phone}
                    </span>
                  )}
                  {franchise.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail size={14} /> {franchise.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
                </button>
                <span className="rounded-md bg-white/10 px-3 py-2 text-sm">
                  {total} products
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-md border border-cavree-border py-2 pl-9 pr-3 text-sm outline-none focus:border-cavree-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCategory("ALL")}
                className={`rounded-md px-3 py-2 text-sm whitespace-nowrap ${category === "ALL" ? "bg-cavree-primary text-white" : "bg-white border border-cavree-border"}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={`rounded-md px-3 py-2 text-sm whitespace-nowrap ${category === cat.slug ? "bg-cavree-primary text-white" : "bg-white border border-cavree-border"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border border-cavree-border bg-white px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md border p-2 ${viewMode === "grid" ? "border-cavree-primary text-cavree-primary" : "border-cavree-border"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md border p-2 ${viewMode === "list" ? "border-cavree-primary text-cavree-primary" : "border-cavree-border"}`}
              >
                <LayoutList size={16} />
              </button>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="rounded-md border border-cavree-border px-3 py-2 text-sm hover:bg-cavree-light"
              >
                Clear ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Real-time indicator */}
        <div className="mb-4 flex items-center gap-2 text-xs text-cavree-muted">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live updates enabled — refreshes every 10 seconds
        </div>

        {/* Products */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg border border-cavree-border bg-white" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-cavree-border bg-white p-16 text-center">
            <Store size={48} className="mx-auto text-cavree-muted" />
            <h2 className="mt-4 font-playfair text-xl font-bold">No products yet</h2>
            <p className="mt-2 text-sm text-cavree-muted">
              This franchise store is being set up. Check back soon for new arrivals.
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group rounded-lg border border-cavree-border bg-white overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-cavree-light">
                  <Image
                    src={product.images?.[0]?.url || "/images/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isNew && (
                    <span className="absolute left-2 top-2 rounded bg-cavree-primary px-2 py-1 text-xs font-medium text-white">
                      New
                    </span>
                  )}
                </Link>
                <div className="p-4">
                  <p className="text-xs text-cavree-muted font-poppins">{product.category?.name || "Uncategorized"}</p>
                  <Link href={`/product/${product.slug}`} className="mt-1 block font-playfair text-base font-semibold line-clamp-1 hover:text-cavree-primary">
                    {product.name}
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" />
                    <span className={`text-xs ${product.quantity <= (product.lowStockThreshold || 5) ? "text-cavree-secondary" : "text-cavree-muted"}`}>
                      {product.quantity > 0 ? `${product.quantity} left` : "Out of stock"}
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProductCardAddToCart product={product} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex gap-4 rounded-lg border border-cavree-border bg-white p-4">
                <Link href={`/product/${product.slug}`} className="relative block h-32 w-24 shrink-0 overflow-hidden rounded-md bg-cavree-light">
                  <Image
                    src={product.images?.[0]?.url || "/images/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-cavree-muted font-poppins">{product.category?.name || "Uncategorized"}</p>
                  <Link href={`/product/${product.slug}`} className="mt-1 block font-playfair text-lg font-semibold hover:text-cavree-primary">
                    {product.name}
                  </Link>
                  <div className="mt-2 flex items-center gap-4">
                    <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" />
                    <span className={`text-xs ${product.quantity <= (product.lowStockThreshold || 5) ? "text-cavree-secondary" : "text-cavree-muted"}`}>
                      {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <ProductCardAddToCart product={product} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-cavree-border bg-white px-6 py-2 text-sm font-medium hover:bg-cavree-light disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
