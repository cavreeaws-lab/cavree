"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, ChevronDown, Grid3X3, LayoutList } from "lucide-react"
import { PriceDisplay } from "@/components/PriceDisplay"
import ProductCardAddToCart from "@/components/ProductCardAddToCart"

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sort, setSort] = useState("random")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [size, setSize] = useState("")
  const [color, setColor] = useState("")
  const [availability, setAvailability] = useState("")
  const [minRating, setMinRating] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const activeFilterKeyRef = useRef("")
  const randomSeedRef = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const limit = 12

  const categoryFilter = searchParams.get("category")
  const searchQuery = searchParams.get("search")
  const filterKey = useMemo(() => JSON.stringify({
    category: categoryFilter || "",
    search: searchQuery || "",
    sort,
    min: priceRange.min,
    max: priceRange.max,
    size,
    color,
    availability,
    minRating,
  }), [categoryFilter, searchQuery, sort, priceRange.min, priceRange.max, size, color, availability, minRating])

  useEffect(() => {
    activeFilterKeyRef.current = filterKey
    setPage(1)
    setProducts([])
    setHasMore(true)
  }, [filterKey])

  useEffect(() => {
    if (activeFilterKeyRef.current !== filterKey) return
    if (page === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    const params = new URLSearchParams()
    if (categoryFilter) params.set("category", categoryFilter)
    if (searchQuery) params.set("search", searchQuery)
    if (priceRange.min) params.set("minPrice", priceRange.min)
    if (priceRange.max) params.set("maxPrice", priceRange.max)
    if (size) params.set("size", size)
    if (color) params.set("color", color)
    if (availability) params.set("availability", availability)
    if (minRating) params.set("minRating", minRating)
    params.set("sort", sort)
    if (sort === "random") params.set("seed", randomSeedRef.current)
    params.set("page", String(page))
    params.set("limit", String(limit))

    const controller = new AbortController()
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (activeFilterKeyRef.current !== filterKey) return
        const nextProducts = data.products || []
        setProducts((prev) => page === 1 ? nextProducts : [...prev, ...nextProducts])
        const nextTotal = data.total || 0
        setTotal(nextTotal)
        setHasMore(page * limit < nextTotal && nextProducts.length > 0)
        setLoading(false)
        setLoadingMore(false)
      })
      .catch((error) => {
        if (error.name === "AbortError") return
        setLoading(false)
        setLoadingMore(false)
      })
    return () => controller.abort()
  }, [categoryFilter, searchQuery, sort, priceRange.min, priceRange.max, size, color, availability, minRating, page, filterKey])

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore) {
        setPage((current) => current + 1)
      }
    }, { rootMargin: "500px 0px" })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore])

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Title */}
      <div className="mb-8">
        <div className="text-sm text-cavree-muted font-poppins mb-2">
          <Link href="/" className="hover:text-cavree-primary">Home</Link>
          <span className="mx-2">/</span>
          <span>Shop</span>
          {categoryFilter && (
            <>
              <span className="mx-2">/</span>
              <span className="capitalize">{categoryFilter}</span>
            </>
          )}
        </div>
        <h1 className="font-playfair text-3xl font-bold">
          {searchQuery ? `Search: "${searchQuery}"` : categoryFilter ? categoryFilter : "All Products"}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 flex-shrink-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-montserrat font-semibold text-sm mb-3">CATEGORIES</h3>
              <div className="space-y-2">
                <Link
                  href="/shop"
                  className={`block text-sm font-poppins ${!categoryFilter ? "text-cavree-primary font-medium" : "text-cavree-muted hover:text-cavree-primary"}`}
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className={`block text-sm font-poppins ${categoryFilter === cat.slug ? "text-cavree-primary font-medium" : "text-cavree-muted hover:text-cavree-primary"}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-montserrat font-semibold text-sm mb-3">SIZE</h3>
              <div className="grid grid-cols-3 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map((item) => (
                  <button key={item} type="button" onClick={() => setSize(size === item ? "" : item)} className={`rounded border px-3 py-2 text-sm ${size === item ? "border-cavree-primary bg-cavree-primary text-white" : "border-cavree-border"}`}>{item}</button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-montserrat font-semibold text-sm mb-3">COLOR</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Black", "White", "Red", "Yellow", "Green", "Pink", "Blue", "Purple"].map((item) => (
                  <button key={item} type="button" onClick={() => setColor(color === item ? "" : item)} className={`rounded border px-3 py-2 text-left text-sm ${color === item ? "border-cavree-primary text-cavree-primary" : "border-cavree-border text-cavree-muted"}`}>{item}</button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-montserrat font-semibold text-sm mb-3">AVAILABILITY</h3>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full rounded border border-cavree-border px-3 py-2 text-sm">
                <option value="">All stock</option>
                <option value="in-stock">In stock</option>
                <option value="low-stock">Low stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </div>

            <div>
              <h3 className="font-montserrat font-semibold text-sm mb-3">RATING</h3>
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full rounded border border-cavree-border px-3 py-2 text-sm">
                <option value="">Any rating</option>
                <option value="4">4 stars and up</option>
                <option value="3">3 stars and up</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-montserrat font-semibold text-sm mb-3">PRICE</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full px-3 py-2 border border-cavree-border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full px-3 py-2 border border-cavree-border rounded text-sm"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-cavree-border">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-2 text-sm font-medium"
            >
              <Filter size={18} />
              Filters
            </button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-white border border-cavree-border rounded px-4 py-2 pr-8 text-sm font-poppins cursor-pointer"
                >
                  <option value="random">Fresh Mix</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-cavree-muted" />
              </div>

              <div className="hidden sm:flex items-center gap-1 border border-cavree-border rounded p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-cavree-primary text-white" : "text-cavree-muted"}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "bg-cavree-primary text-white" : "text-cavree-muted"}`}
                >
                  <LayoutList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
                  <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-cavree-muted font-poppins">No products found</p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" : "space-y-4"}>
              {products.map((product) => (
                <div key={product.id} className={viewMode === "list" ? "flex gap-4 p-4 border border-cavree-border rounded-lg" : "group"}>
                  <Link href={`/product/${product.slug}`} className={`block relative overflow-hidden rounded-lg bg-cavree-light ${viewMode === "list" ? "w-32 h-40 flex-shrink-0" : "aspect-[3/4]"}`}>
                    <Image
                      src={product.images[0]?.url || "/images/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className={viewMode === "list" ? "flex-1" : "mt-3"}>
                    <p className="text-xs text-cavree-muted font-poppins">{product.category?.name}</p>
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-playfair text-base font-semibold mt-0.5 group-hover:text-cavree-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-1">
                      <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" />
                    </div>
                    <ProductCardAddToCart product={product} className={viewMode === "list" ? "max-w-xs" : ""} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div ref={loadMoreRef} className="mt-8 min-h-8 text-center text-sm text-cavree-muted font-poppins">
            {loadingMore ? "Loading more..." : products.length > 0 && !hasMore ? "You have reached the end." : ""}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-96 flex items-center justify-center"><p className="text-cavree-muted">Loading...</p></div></div>}>
      <ShopContent />
    </Suspense>
  )
}
