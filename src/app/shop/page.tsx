"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { Filter, ChevronDown, Grid3X3, LayoutList, ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"

function ShopContent() {
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sort, setSort] = useState("newest")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })

  const categoryFilter = searchParams.get("category")
  const searchQuery = searchParams.get("search")

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categoryFilter) params.set("category", categoryFilter)
    if (searchQuery) params.set("search", searchQuery)
    if (priceRange.min) params.set("minPrice", priceRange.min)
    if (priceRange.max) params.set("maxPrice", priceRange.max)
    params.set("sort", sort)

    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [categoryFilter, searchQuery, sort, priceRange])

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
  }, [])

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0]?.url || "/images/placeholder.jpg",
    })
    toast.success("Added to cart!")
  }

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
        <p className="text-cavree-muted mt-1 font-poppins text-sm">
          {products.length} products found
        </p>
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
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-montserrat font-semibold text-sm">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-cavree-muted-light line-through">
                          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 border border-cavree-primary text-cavree-primary text-sm font-medium rounded-md hover:bg-cavree-primary hover:text-white transition-colors"
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
