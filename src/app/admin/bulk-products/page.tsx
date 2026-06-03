"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Edit2, ImagePlus, Search, Video } from "lucide-react"

const emptyForm = {
  productId: "",
  name: "",
  productType: "",
  shirtType: "",
  modelNumber: "",
  category: "Women",
  description: "",
  wholesalePrice: "",
  singlePiecePrice: "",
  unitSize: "1000",
  minUnits: "1",
  availableUnits: "",
  image: "",
  videoUrl: "",
  isActive: true,
  isFeatured: false,
}

export default function AdminBulkProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("ALL")
  const [saving, setSaving] = useState(false)

  const load = () => fetch("/api/admin/bulk-products").then((res) => res.json()).then((data) => setProducts(data.products || []))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = !search || [product.name, product.productId, product.category].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = status === "ALL" || (status === "ACTIVE" ? product.isActive : !product.isActive)
    return matchesSearch && matchesStatus
  }), [products, search, status])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    const media = [
      form.image ? { type: "IMAGE", url: form.image, alt: form.name } : null,
      form.videoUrl ? { type: "VIDEO", url: form.videoUrl, posterUrl: form.image || undefined, alt: form.name } : null,
    ].filter(Boolean)
    const res = await fetch("/api/admin/bulk-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        media,
        specs: {
          productType: form.productType,
          shirtType: form.shirtType,
          modelNumber: form.modelNumber,
        },
        wholesalePrice: Number(form.wholesalePrice),
        singlePiecePrice: Number(form.singlePiecePrice || 0),
        unitSize: Number(form.unitSize || 1000),
        minUnits: Number(form.minUnits || 1),
        availableUnits: Number(form.availableUnits || 0),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return toast.error(typeof data.error === "string" ? data.error : "Failed to save bulk product")
    toast.success("Bulk product saved")
    setForm(emptyForm)
    load()
  }

  const edit = (product: any) => {
    const specs = product.specs || {}
    const media = Array.isArray(product.media) ? product.media : []
    const video = media.find((item: any) => item.type === "VIDEO")
    setForm({
      productId: product.productId,
      name: product.name,
      productType: specs.productType || "",
      shirtType: specs.shirtType || "",
      modelNumber: specs.modelNumber || "",
      category: product.category,
      description: product.description || "",
      wholesalePrice: String(product.wholesalePrice || ""),
      singlePiecePrice: String(product.singlePiecePrice || ""),
      unitSize: String(product.unitSize || 1000),
      minUnits: String(product.minUnits || 1),
      availableUnits: String(product.availableUnits || 0),
      image: product.image || media.find((item: any) => item.type === "IMAGE")?.url || "",
      videoUrl: video?.url || "",
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Bulk Products</h2>
        <p className="text-sm text-cavree-muted">Wholesale catalog for franchise and sales portals.</p>
      </div>

      <form onSubmit={save} className="space-y-4 rounded-lg border border-cavree-border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} placeholder="Product ID" className="input" />
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="input md:col-span-2" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input"><option>Women</option><option>Men</option><option>Kids</option></select>
          <input value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} placeholder="Product type" className="input" />
          <input value={form.shirtType} onChange={(e) => setForm({ ...form, shirtType: e.target.value })} placeholder="Shirt type" className="input" />
          <input value={form.modelNumber} onChange={(e) => setForm({ ...form, modelNumber: e.target.value })} placeholder="Model number" className="input" />
          <input required type="number" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })} placeholder="Franchise bulk price" className="input" />
          <input type="number" value={form.singlePiecePrice} onChange={(e) => setForm({ ...form, singlePiecePrice: e.target.value })} placeholder="Single piece price" className="input" />
          <input type="number" value={form.minUnits} onChange={(e) => setForm({ ...form, minUnits: e.target.value })} placeholder="Minimum units" className="input" />
          <input type="number" value={form.unitSize} onChange={(e) => setForm({ ...form, unitSize: e.target.value })} placeholder="Pieces per unit" className="input" />
          <input type="number" value={form.availableUnits} onChange={(e) => setForm({ ...form, availableUnits: e.target.value })} placeholder="Available units" className="input" />
        </div>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description and product specs" rows={3} className="input resize-none" />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            <span className="inline-flex items-center gap-2"><ImagePlus size={16} /> Image URL</span>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="input" />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span className="inline-flex items-center gap-2"><Video size={16} /> Video URL</span>
            <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://...mp4" className="input" />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
          <button disabled={saving} className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : "Save Bulk Product"}</button>
        </div>
      </form>

      <div className="grid gap-3 rounded-lg border border-cavree-border bg-white p-4 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product ID, name, category" className="input pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input"><option>ALL</option><option>ACTIVE</option><option>INACTIVE</option></select>
      </div>

      <div className="overflow-hidden rounded-lg border border-cavree-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-cavree-light text-left text-xs uppercase text-cavree-muted"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Units</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-cavree-border">
              {filtered.map((product) => {
                const specs = product.specs || {}
                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3"><p className="font-medium">{product.name}</p><p className="text-xs text-cavree-muted">{product.productId}{specs.modelNumber ? ` · ${specs.modelNumber}` : ""}</p></td>
                    <td className="px-4 py-3">{specs.productType || product.category}<p className="text-xs text-cavree-muted">{specs.shirtType || "-"}</p></td>
                    <td className="px-4 py-3">{product.availableUnits}<p className="text-xs text-cavree-muted">Min {product.minUnits} · {product.unitSize} pcs</p></td>
                    <td className="px-4 py-3">₹{product.wholesalePrice.toLocaleString("en-IN")}<p className="text-xs text-cavree-muted">Single ₹{product.singlePiecePrice.toLocaleString("en-IN")}</p></td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{product.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3 text-right"><button onClick={() => edit(product)} className="inline-flex items-center gap-1 text-cavree-primary"><Edit2 size={15} /> Edit</button></td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-cavree-muted">No bulk products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
