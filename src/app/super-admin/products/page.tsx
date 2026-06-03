"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react"
import toast from "react-hot-toast"
import { PriceDisplay } from "@/components/PriceDisplay"

const PAGE_SIZE = 20

export default function SuperAdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (status) params.set("status", status)
    params.set("page", String(page))
    params.set("limit", String(PAGE_SIZE))
    return params.toString()
  }, [search, status, page])

  const fetchProducts = () => {
    setLoading(true)
    fetch(`/api/super-admin/products?${query}`)
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
  }

  useEffect(() => {
    fetchProducts()
  }, [query])

  const exportCsv = () => {
    const params = new URLSearchParams(query)
    params.set("export", "csv")
    window.location.href = `/api/super-admin/products?${params.toString()}`
  }

  const toggleProduct = async (product: any) => {
    const res = await fetch(`/api/super-admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    })

    if (!res.ok) {
      toast.error("Failed to update product")
      return
    }

    toast.success("Product updated")
    fetchProducts()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-playfair text-xl font-bold">All Products</h2>
          <p className="mt-1 text-sm text-cavree-muted">Review product availability and franchise catalog health.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white hover:bg-cavree-primary/90">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cavree-muted" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search name, SKU, brand, or franchise"
            className="w-full rounded-md border border-cavree-border py-2 pl-10 pr-3 text-sm outline-none focus:border-cavree-primary"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="rounded-md border border-cavree-border px-3 py-2 text-sm outline-none focus:border-cavree-primary"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-cavree-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px]">
            <thead>
              <tr className="bg-cavree-light">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Franchise</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-cavree-muted">Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-cavree-muted">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-cavree-muted">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-cavree-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cavree-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-cavree-muted">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-cavree-muted">No products found.</td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-cavree-light/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-cavree-text">{product.name}</div>
                      <div className="mt-1 text-xs text-cavree-muted">{product.sku}{product.brand ? ` · ${product.brand}` : ""}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-poppins">{product.franchise?.name || "-"}</td>
                    <td className="px-6 py-4 text-sm font-poppins">{product.category?.name || "-"}</td>
                    <td className="px-6 py-4 text-right text-sm font-poppins">
                      <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" align="right" />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-poppins">
                      <span className={product.quantity <= (product.lowStockThreshold || 5) ? "font-semibold text-amber-700" : ""}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleProduct(product)} className="text-sm font-medium text-cavree-primary hover:underline">
                        {product.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-cavree-muted">
        <span>{total.toLocaleString("en-IN")} products</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-cavree-border p-2 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-md border border-cavree-border p-2 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
