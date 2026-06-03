"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react"
import toast from "react-hot-toast"

type ProductFormProps = {
  mode: "create" | "edit"
  productId?: string
}

const tabs = ["General", "Pricing", "Inventory", "Variants", "Media", "SEO", "Shipping"]
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const VIDEO_TYPES = ["video/mp4", "video/webm"]
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
const VIDEO_EXTENSIONS = [".mp4", ".webm"]
const IMAGE_MAX_SIZE = 10 * 1024 * 1024
const VIDEO_MAX_SIZE = 100 * 1024 * 1024

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  modelNumber: "",
  productType: "",
  shirtType: "",
  brand: "",
  barcode: "",
  sku: "",
  price: "",
  compareAtPrice: "",
  costPrice: "",
  singlePiecePrice: "",
  franchiseBulkPrice: "",
  minimumQuantityLimit: "",
  quantity: "",
  categoryId: "",
  tags: "",
  isActive: true,
  isFeatured: false,
  isNew: false,
  trackQuantity: true,
  allowBackorders: false,
  lowStockThreshold: "5",
  weight: "",
  length: "",
  width: "",
  height: "",
  metaTitle: "",
  metaDescription: "",
}

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("General")
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState<any[]>([])
  const [media, setMedia] = useState<Array<{ type: "IMAGE" | "VIDEO"; url: string; posterUrl: string; alt: string }>>([])
  const [variants, setVariants] = useState<Array<{ size: string; color: string; colorCode: string; sku: string; price: string; quantity: string }>>([])
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (mode !== "edit" || !productId) return
    setLoading(true)
    fetch(`/api/admin/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        const product = data.product
        const dimensions = product.dimensions || {}
        setForm({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          modelNumber: product.modelNumber || "",
          productType: product.productType || "",
          shirtType: product.shirtType || "",
          brand: product.brand || "",
          barcode: product.barcode || "",
          sku: product.sku || "",
          price: String(product.price || ""),
          compareAtPrice: product.comparePrice ? String(product.comparePrice) : "",
          costPrice: product.costPrice ? String(product.costPrice) : "",
          singlePiecePrice: product.singlePiecePrice ? String(product.singlePiecePrice) : "",
          franchiseBulkPrice: product.franchiseBulkPrice ? String(product.franchiseBulkPrice) : "",
          minimumQuantityLimit: product.minimumQuantityLimit ? String(product.minimumQuantityLimit) : "",
          quantity: String(product.quantity || ""),
          categoryId: product.categoryId || "",
          tags: (product.tags || []).join(", "),
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          isNew: product.isNew ?? false,
          trackQuantity: product.trackQuantity ?? true,
          allowBackorders: product.allowBackorders ?? false,
          lowStockThreshold: String(product.lowStockThreshold ?? 5),
          weight: product.weight ? String(product.weight) : "",
          length: dimensions.length ? String(dimensions.length) : "",
          width: dimensions.width ? String(dimensions.width) : "",
          height: dimensions.height ? String(dimensions.height) : "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
        })
        setMedia((product.media?.length ? product.media : product.images || []).map((item: any) => ({
          type: item.type || "IMAGE",
          url: item.url || "",
          posterUrl: item.posterUrl || "",
          alt: item.alt || "",
        })))
        setVariants((product.variants || []).map((variant: any) => ({
          size: variant.size || "",
          color: variant.color || "",
          colorCode: variant.colorCode || "",
          sku: variant.sku || "",
          price: variant.price ? String(variant.price) : "",
          quantity: String(variant.quantity || 0),
        })))
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false))
  }, [mode, productId])

  const payload = useMemo(() => ({
    name: form.name,
    slug: form.slug || undefined,
    description: form.description || undefined,
    modelNumber: form.modelNumber || undefined,
    productType: form.productType || undefined,
    shirtType: form.shirtType || undefined,
    brand: form.brand || undefined,
    barcode: form.barcode || undefined,
    sku: form.sku,
    price: Number(form.price),
    compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
    costPrice: form.costPrice ? Number(form.costPrice) : undefined,
    singlePiecePrice: form.singlePiecePrice ? Number(form.singlePiecePrice) : undefined,
    franchiseBulkPrice: form.franchiseBulkPrice ? Number(form.franchiseBulkPrice) : undefined,
    minimumQuantityLimit: form.minimumQuantityLimit ? Number(form.minimumQuantityLimit) : undefined,
    quantity: Number(form.quantity || 0),
    categoryId: form.categoryId,
    tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    isNew: form.isNew,
    trackQuantity: form.trackQuantity,
    allowBackorders: form.allowBackorders,
    lowStockThreshold: Number(form.lowStockThreshold || 5),
    weight: form.weight ? Number(form.weight) : undefined,
    dimensions: {
      length: form.length ? Number(form.length) : undefined,
      width: form.width ? Number(form.width) : undefined,
      height: form.height ? Number(form.height) : undefined,
    },
    metaTitle: form.metaTitle || undefined,
    metaDescription: form.metaDescription || undefined,
    images: media.filter((item) => item.type === "IMAGE" && item.url.trim()).map((item) => ({ url: item.url, alt: item.alt || undefined })),
    media: media.filter((item) => item.url.trim()).map((item) => ({
      type: item.type,
      url: item.url,
      posterUrl: item.posterUrl || undefined,
      alt: item.alt || undefined,
    })),
    variants: variants
      .filter((variant) => variant.size || variant.color || variant.sku)
      .map((variant) => ({
        size: variant.size || undefined,
        color: variant.color || undefined,
        colorCode: variant.colorCode || undefined,
        sku: variant.sku || undefined,
        price: variant.price ? Number(variant.price) : undefined,
        quantity: Number(variant.quantity || 0),
      })),
  }), [form, media, variants])

  const setField = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const getUploadError = (file: File, expectedType?: "IMAGE" | "VIDEO") => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    const isImage = IMAGE_TYPES.includes(file.type) || IMAGE_EXTENSIONS.includes(ext)
    const isVideo = VIDEO_TYPES.includes(file.type) || VIDEO_EXTENSIONS.includes(ext)
    if (!isImage && !isVideo) return "Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4, or WEBM."
    if (expectedType === "IMAGE" && !isImage) return "Please upload an image file for this field."
    if (expectedType === "VIDEO" && !isVideo) return "Please upload an MP4 or WEBM video."
    if (isVideo && file.size > VIDEO_MAX_SIZE) return "Video must be under 100MB."
    if (isImage && file.size > IMAGE_MAX_SIZE) return "Image must be under 10MB."
    return null
  }

  const detectMediaType = (file: File): "IMAGE" | "VIDEO" => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    return VIDEO_TYPES.includes(file.type) || VIDEO_EXTENSIONS.includes(ext) ? "VIDEO" : "IMAGE"
  }

  const uploadMedia = async (file: File, index: number, field: "url" | "posterUrl" = "url") => {
    const expectedType = field === "posterUrl" ? "IMAGE" : undefined
    const validationError = getUploadError(file, expectedType)
    if (validationError) {
      toast.error(validationError)
      return
    }
    setUploading((prev) => ({ ...prev, [index]: true }))
    try {
      const detectedType = detectMediaType(file)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Upload failed")
        return
      }
      const uploadRes = await fetch(data.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!uploadRes.ok) {
        throw new Error(`S3 rejected upload with ${uploadRes.status}. Check bucket CORS and file permissions.`)
      }
      setMedia((prev) => prev.map((item, i) => i === index ? { ...item, type: field === "url" ? detectedType : item.type, [field]: data.url } : item))
      toast.success("Uploaded")
    } catch (error: any) {
      toast.error(error.message || "Upload failed")
    } finally {
      setUploading((prev) => ({ ...prev, [index]: false }))
      const input = document.getElementById(`media-upload-${index}-${field}`) as HTMLInputElement | null
      if (input) input.value = ""
    }
  }

  const addMediaRow = (type: "IMAGE" | "VIDEO") => {
    setMedia((prev) => [...prev, { type, url: "", posterUrl: "", alt: "" }])
  }

  const moveMedia = (index: number, direction: -1 | 1) => {
    setMedia((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      const item = next[index]
      next[index] = next[target]
      next[target] = item
      return next
    })
  }

  const hasActiveUploads = Object.values(uploading).some(Boolean)

  const renderPreview = (item: { type: "IMAGE" | "VIDEO"; url: string; posterUrl: string; alt: string }) => {
    if (!item.url) return null
    if (item.type === "VIDEO") {
      return <video src={item.url} poster={item.posterUrl || undefined} controls className="mt-3 h-40 w-full rounded-md bg-black object-contain" />
    }
    return <img src={item.url} alt={item.alt || "Product media preview"} className="mt-3 h-40 w-full rounded-md object-cover" />
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name || !form.sku || !form.price || !form.categoryId) {
      toast.error("Name, SKU, price, and category are required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error?.name?.[0] || data.error?.sku?.[0] || data.error || "Failed to save product")
        return
      }
      toast.success(mode === "create" ? "Product created" : "Product updated")
      router.push("/admin/products")
    } catch {
      toast.error("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-lg border border-cavree-border bg-white" />
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-playfair text-xl font-bold">{mode === "create" ? "Add Product" : "Edit Product"}</h2>
          <p className="text-sm text-cavree-muted font-poppins">Complete each tab before publishing catalog changes.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.push("/admin/products")} className="rounded-md border border-cavree-border px-4 py-2 text-sm font-medium hover:bg-cavree-light">Cancel</button>
          <button type="submit" disabled={saving || hasActiveUploads} className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white hover:bg-cavree-primary-light disabled:opacity-50">
            {hasActiveUploads ? "Uploading..." : saving ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-cavree-border bg-white">
        <div className="flex overflow-x-auto border-b border-cavree-border px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${activeTab === tab ? "border-cavree-primary text-cavree-primary" : "border-transparent text-cavree-muted hover:text-cavree-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "General" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Name *"><input value={form.name} onChange={(e) => setField("name", e.target.value)} className="input" /></Field>
              <Field label="Slug"><input value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="auto-generated if empty" className="input" /></Field>
              <Field label="SKU *"><input value={form.sku} onChange={(e) => setField("sku", e.target.value)} className="input" /></Field>
              <Field label="Model number"><input value={form.modelNumber} onChange={(e) => setField("modelNumber", e.target.value)} placeholder="Shown under product name" className="input" /></Field>
              <Field label="Product type"><input value={form.productType} onChange={(e) => setField("productType", e.target.value)} placeholder="Kurta set, gown, shirt..." className="input" /></Field>
              <Field label="Shirt type"><input value={form.shirtType} onChange={(e) => setField("shirtType", e.target.value)} placeholder="Optional apparel subtype" className="input" /></Field>
              <Field label="Category *">
                <select value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)} className="input">
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </Field>
              <Field label="Brand"><input value={form.brand} onChange={(e) => setField("brand", e.target.value)} className="input" /></Field>
              <Field label="Tags"><input value={form.tags} onChange={(e) => setField("tags", e.target.value)} placeholder="comma separated" className="input" /></Field>
              <Field label="Description" className="lg:col-span-2"><textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={5} className="input resize-none" /></Field>
              <Toggle label="Active" checked={form.isActive} onChange={(value) => setField("isActive", value)} />
              <Toggle label="Featured" checked={form.isFeatured} onChange={(value) => setField("isFeatured", value)} />
              <Toggle label="New arrival" checked={form.isNew} onChange={(value) => setField("isNew", value)} />
            </div>
          )}

          {activeTab === "Pricing" && (
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Price *"><input type="number" value={form.price} onChange={(e) => setField("price", e.target.value)} className="input" /></Field>
              <Field label="Compare price"><input type="number" value={form.compareAtPrice} onChange={(e) => setField("compareAtPrice", e.target.value)} className="input" /></Field>
              <Field label="Cost per item"><input type="number" value={form.costPrice} onChange={(e) => setField("costPrice", e.target.value)} className="input" /></Field>
              <Field label="Single piece price"><input type="number" value={form.singlePiecePrice} onChange={(e) => setField("singlePiecePrice", e.target.value)} className="input" /></Field>
              <Field label="Franchise bulk price"><input type="number" value={form.franchiseBulkPrice} onChange={(e) => setField("franchiseBulkPrice", e.target.value)} className="input" /></Field>
              <Field label="Minimum quantity limit"><input type="number" value={form.minimumQuantityLimit} onChange={(e) => setField("minimumQuantityLimit", e.target.value)} className="input" /></Field>
            </div>
          )}

          {activeTab === "Inventory" && (
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Barcode"><input value={form.barcode} onChange={(e) => setField("barcode", e.target.value)} className="input" /></Field>
              <Field label="Stock quantity"><input type="number" value={form.quantity} onChange={(e) => setField("quantity", e.target.value)} className="input" /></Field>
              <Field label="Low stock alert"><input type="number" value={form.lowStockThreshold} onChange={(e) => setField("lowStockThreshold", e.target.value)} className="input" /></Field>
              <Toggle label="Track quantity" checked={form.trackQuantity} onChange={(value) => setField("trackQuantity", value)} />
              <Toggle label="Allow backorders" checked={form.allowBackorders} onChange={(value) => setField("allowBackorders", value)} />
            </div>
          )}

          {activeTab === "Variants" && (
            <div className="space-y-4">
              <button type="button" onClick={() => setVariants((prev) => [...prev, { size: "", color: "", colorCode: "", sku: "", price: "", quantity: "0" }])} className="inline-flex items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm hover:bg-cavree-light"><Plus size={16} /> Add variant</button>
              {variants.map((variant, index) => (
                <div key={index} className="grid gap-3 rounded-lg border border-cavree-border p-4 md:grid-cols-6">
                  {(["size", "color", "colorCode", "sku", "price", "quantity"] as const).map((key) => (
                    <Field key={key} label={key === "colorCode" ? "Color code" : key}>
                      <input value={variant[key]} type={key === "price" || key === "quantity" ? "number" : "text"} onChange={(e) => setVariants((prev) => prev.map((item, i) => i === index ? { ...item, [key]: e.target.value } : item))} className="input" />
                    </Field>
                  ))}
                  <button type="button" onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))} className="md:col-span-6 inline-flex w-fit items-center gap-2 text-sm text-red-600 hover:underline"><Trash2 size={15} /> Remove variant</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Media" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => addMediaRow("IMAGE")} className="inline-flex items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm hover:bg-cavree-light"><ImagePlus size={16} /> Add Image</button>
                <button type="button" onClick={() => addMediaRow("VIDEO")} className="inline-flex items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm hover:bg-cavree-light"><Upload size={16} /> Add Video</button>
              </div>
              {media.map((item, index) => (
                <div key={index} className="rounded-lg border border-cavree-border p-4">
                  <div className="grid gap-3 lg:grid-cols-[120px_1fr_1fr_auto]">
                  <select value={item.type} onChange={(e) => setMedia((prev) => prev.map((entry, i) => i === index ? { ...entry, type: e.target.value as "IMAGE" | "VIDEO" } : entry))} className="input">
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                  <input value={item.url} onChange={(e) => setMedia((prev) => prev.map((entry, i) => i === index ? { ...entry, url: e.target.value } : entry))} placeholder="Media URL" className="input" />
                  <input value={item.alt} onChange={(e) => setMedia((prev) => prev.map((entry, i) => i === index ? { ...entry, alt: e.target.value } : entry))} placeholder="Alt text" className="input" />
                  <button type="button" onClick={() => setMedia((prev) => prev.filter((_, i) => i !== index))} className="rounded-md border border-red-200 px-3 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                  {item.type === "VIDEO" && (
                    <input value={item.posterUrl} onChange={(e) => setMedia((prev) => prev.map((entry, i) => i === index ? { ...entry, posterUrl: e.target.value } : entry))} placeholder="Video poster URL" className="input lg:col-span-2" />
                  )}
                  <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm hover:bg-cavree-light">
                    <Upload size={16} />
                    {uploading[index] ? "Uploading..." : `Upload ${item.type === "VIDEO" ? "video" : "image"}`}
                    <input id={`media-upload-${index}-url`} disabled={uploading[index]} type="file" accept={item.type === "VIDEO" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/gif"} className="hidden" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0], index)} />
                  </label>
                  {item.type === "VIDEO" && (
                    <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm hover:bg-cavree-light">
                      <Upload size={16} />
                      Upload poster
                      <input id={`media-upload-${index}-posterUrl`} disabled={uploading[index]} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0], index, "posterUrl")} />
                    </label>
                  )}
                  <div className="flex gap-2 lg:col-span-2">
                    <button type="button" onClick={() => moveMedia(index, -1)} disabled={index === 0} className="rounded-md border border-cavree-border px-3 py-2 text-sm disabled:opacity-40">Move up</button>
                    <button type="button" onClick={() => moveMedia(index, 1)} disabled={index === media.length - 1} className="rounded-md border border-cavree-border px-3 py-2 text-sm disabled:opacity-40">Move down</button>
                  </div>
                  </div>
                  {renderPreview(item)}
                </div>
              ))}
            </div>
          )}

          {activeTab === "SEO" && (
            <div className="grid gap-4">
              <Field label="Meta title"><input value={form.metaTitle} onChange={(e) => setField("metaTitle", e.target.value)} className="input" /></Field>
              <Field label="Meta description"><textarea value={form.metaDescription} onChange={(e) => setField("metaDescription", e.target.value)} rows={4} className="input resize-none" /></Field>
            </div>
          )}

          {activeTab === "Shipping" && (
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label="Weight"><input type="number" value={form.weight} onChange={(e) => setField("weight", e.target.value)} className="input" /></Field>
              <Field label="Length"><input type="number" value={form.length} onChange={(e) => setField("length", e.target.value)} className="input" /></Field>
              <Field label="Width"><input type="number" value={form.width} onChange={(e) => setField("width", e.target.value)} className="input" /></Field>
              <Field label="Height"><input type="number" value={form.height} onChange={(e) => setField("height", e.target.value)} className="input" /></Field>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium capitalize text-cavree-muted font-poppins">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-poppins">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}
