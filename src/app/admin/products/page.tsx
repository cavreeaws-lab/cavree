"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, ChevronLeft, ChevronRight, Filter, Download, Copy, Edit, Trash2, Grid3X3, List } from "lucide-react"
import toast from "react-hot-toast"
import { PriceDisplay } from "@/components/PriceDisplay"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [stockFilter, setStockFilter] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter !== "ALL") params.set("isActive", statusFilter)
    if (categoryFilter) params.set("categoryId", categoryFilter)
    if (stockFilter) params.set("stockStatus", stockFilter)
    params.set("page", String(page))
    params.set("limit", String(limit))
    fetch(`/api/admin/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load products")
        setLoading(false)
      })
  }, [search, statusFilter, categoryFilter, stockFilter, page])

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  const exportCsv = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter !== "ALL") params.set("isActive", statusFilter)
    if (categoryFilter) params.set("categoryId", categoryFilter)
    if (stockFilter) params.set("stockStatus", stockFilter)
    params.set("export", "csv")
    window.location.href = `/api/admin/products?${params.toString()}`
  }

  const duplicateProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" })
      if (!res.ok) throw new Error()
      toast.success("Product duplicated as inactive draft")
      setPage(1)
      const refresh = await fetch(`/api/admin/products?page=1&limit=${limit}`)
      const data = await refresh.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch {
      toast.error("Failed to duplicate product")
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setProducts((prev) => prev.filter((product) => product.id !== id))
      setTotal((value) => Math.max(0, value - 1))
      toast.success("Product deleted")
    } catch {
      toast.error("Failed to delete product")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-playfair text-xl font-bold">Products</h2>
          <p className="text-sm text-cavree-muted font-poppins">Manage catalog, stock, pricing, media, and drafts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 border border-cavree-border bg-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-light transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light transition-colors"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="w-full border border-cavree-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-cavree-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary"
        >
          <option value="ALL">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => { setStockFilter(e.target.value); setPage(1) }}
          className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary"
        >
          <option value="">All Stock</option>
          <option value="in">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <div className="flex items-center justify-end gap-1 rounded-md border border-cavree-border p-1">
          <button onClick={() => setViewMode("table")} className={`rounded p-1.5 ${viewMode === "table" ? "bg-cavree-primary text-white" : "text-cavree-muted"}`}><List size={17} /></button>
          <button onClick={() => setViewMode("grid")} className={`rounded p-1.5 ${viewMode === "grid" ? "bg-cavree-primary text-white" : "text-cavree-muted"}`}><Grid3X3 size={17} /></button>
        </div>
      </div>

      {viewMode === "grid" && !loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-lg border border-cavree-border bg-white p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-cavree-light">
                <Image src={product.images?.[0]?.url || "/images/placeholder.jpg"} alt={product.name} fill className="object-cover" />
              </div>
              <div className="mt-3">
                <p className="text-xs text-cavree-muted font-poppins">{product.category?.name || "Uncategorized"}</p>
                <h3 className="mt-1 font-playfair text-base font-semibold line-clamp-1">{product.name}</h3>
                <p className="text-xs text-cavree-muted font-poppins mt-0.5">{product.franchise?.name || "No franchise"}</p>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" />
                  <span className={product.quantity <= (product.lowStockThreshold || 5) ? "text-cavree-secondary" : "text-cavree-muted"}>{product.quantity} in stock</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1 rounded-md border border-cavree-border px-3 py-2 text-center text-sm hover:bg-cavree-light">Edit</Link>
                  <button onClick={() => duplicateProduct(product.id)} className="rounded-md border border-cavree-border p-2 hover:bg-cavree-light"><Copy size={16} /></button>
                  <button onClick={() => deleteProduct(product.id)} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cavree-light">
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">SKU</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Franchise</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-6 py-4"><div className="h-8 animate-pulse rounded bg-cavree-light" /></td></tr>
              )) : products.map((product) => (
                <tr key={product.id} className="hover:bg-cavree-light/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-cavree-light flex-shrink-0">
                        <Image src={product.images?.[0]?.url || "/images/placeholder.jpg"} alt={product.name} fill className="object-cover" />
                      </div>
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-poppins">{product.sku}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{product.category?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{product.franchise?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" />
                  </td>
                  <td className={`px-6 py-4 text-sm font-poppins ${product.quantity <= (product.lowStockThreshold || 5) ? "text-cavree-secondary font-medium" : ""}`}>{product.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="rounded-md p-2 text-cavree-muted hover:bg-cavree-light hover:text-cavree-primary"><Edit size={16} /></Link>
                      <button onClick={() => duplicateProduct(product.id)} className="rounded-md p-2 text-cavree-muted hover:bg-cavree-light hover:text-cavree-primary"><Copy size={16} /></button>
                      <button onClick={() => deleteProduct(product.id)} className="rounded-md p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-cavree-border text-sm font-poppins">
          <p className="text-cavree-muted">{total} products</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-cavree-light disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
            <button
              onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
              disabled={page * limit >= total}
              className="p-1 rounded hover:bg-cavree-light disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
