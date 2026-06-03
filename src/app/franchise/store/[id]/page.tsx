"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { ArrowLeft, CheckCircle2, Minus, PackageCheck, Plus, ShoppingCart } from "lucide-react"

function getMedia(product: any) {
  const media = Array.isArray(product?.media) ? product.media : []
  if (media.length) return media
  return product?.image ? [{ type: "IMAGE", url: product.image, alt: product.name }] : []
}

export default function FranchiseBulkProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMedia, setSelectedMedia] = useState(0)
  const [unitCount, setUnitCount] = useState(1)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/franchise/bulk-products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product)
          setUnitCount(Math.max(1, data.product.minUnits || 1))
        }
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const media = useMemo(() => getMedia(product), [product])
  const selectedUnitCodes = useMemo(() => {
    const units = product?.units || []
    if (units.length) return units.slice(0, unitCount).map((unit: any) => unit.unitCode)
    return Array.from({ length: unitCount }, (_, index) => `${product?.productId || "UNIT"}-${String(index + 1).padStart(3, "0")}`)
  }, [product, unitCount])

  if (loading) return <div className="h-96 animate-pulse rounded-lg border border-cavree-border bg-white" />
  if (!product) {
    return (
      <div className="rounded-lg border border-cavree-border bg-white p-10 text-center">
        <h2 className="font-playfair text-2xl font-bold">Bulk product not found</h2>
        <Link href="/franchise/store" className="mt-4 inline-flex text-cavree-primary">Back to store</Link>
      </div>
    )
  }

  const specs = product.specs || {}
  const totalPieces = unitCount * product.unitSize
  const subtotal = unitCount * product.wholesalePrice

  const addToCart = async () => {
    setSaving(true)
    const res = await fetch("/api/franchise/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, unitCount }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      toast.error(data.error || "Could not add product")
      return
    }
    toast.success("Added to bulk cart")
    router.push("/franchise/cart")
  }

  return (
    <div className="space-y-6">
      <Link href="/franchise/store" className="inline-flex items-center gap-2 text-sm text-cavree-muted hover:text-cavree-primary">
        <ArrowLeft size={16} /> Back to bulk store
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-cavree-border bg-white">
            {media[selectedMedia]?.type === "VIDEO" ? (
              <video src={media[selectedMedia].url} poster={media[selectedMedia].posterUrl || product.image || undefined} controls className="h-full w-full object-cover" />
            ) : media[selectedMedia]?.url ? (
              <Image src={media[selectedMedia].url} alt={media[selectedMedia].alt || product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-cavree-muted">No media</div>
            )}
          </div>
          {media.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {media.map((item: any, index: number) => (
                <button key={`${item.url}-${index}`} onClick={() => setSelectedMedia(index)} className={`relative aspect-square overflow-hidden rounded-md border ${selectedMedia === index ? "border-cavree-primary" : "border-cavree-border"}`}>
                  {item.type === "VIDEO" ? (
                    <video src={item.url} className="h-full w-full object-cover" />
                  ) : (
                    <Image src={item.url} alt={item.alt || product.name} fill className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-cavree-border bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-cavree-muted">{product.productId} · {product.category}</p>
          <h1 className="mt-2 font-playfair text-3xl font-bold">{product.name}</h1>
          {product.description && <p className="mt-3 text-sm leading-6 text-cavree-muted">{product.description}</p>}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-cavree-light p-3">
              <p className="text-xs text-cavree-muted">Wholesale</p>
              <p className="font-montserrat text-xl font-bold">₹{product.wholesalePrice.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-md bg-cavree-light p-3">
              <p className="text-xs text-cavree-muted">Single piece</p>
              <p className="font-montserrat text-xl font-bold">₹{product.singlePiecePrice.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-cavree-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Select units</p>
                <p className="text-xs text-cavree-muted">Min {product.minUnits} · Available {product.availableUnits}</p>
              </div>
              <div className="flex items-center rounded-md border border-cavree-border">
                <button onClick={() => setUnitCount((value) => Math.max(product.minUnits, value - 1))} className="p-2"><Minus size={15} /></button>
                <span className="w-10 text-center text-sm font-semibold">{unitCount}</span>
                <button onClick={() => setUnitCount((value) => Math.min(product.availableUnits, value + 1))} className="p-2"><Plus size={15} /></button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p><span className="text-cavree-muted">Pieces:</span> {totalPieces.toLocaleString("en-IN")}</p>
              <p><span className="text-cavree-muted">Subtotal:</span> ₹{subtotal.toLocaleString("en-IN")}</p>
            </div>
            <p className="mt-3 break-words text-xs text-cavree-muted">Units: {selectedUnitCodes.join(", ")}</p>
          </div>

          <button disabled={saving || product.availableUnits < product.minUnits} onClick={addToCart} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cavree-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-50">
            <ShoppingCart size={16} /> {saving ? "Adding..." : "Add to Bulk Cart"}
          </button>

          <div className="mt-5 space-y-2 border-t border-cavree-border pt-5 text-sm">
            {[
              ["Model", specs.modelNumber],
              ["Product type", specs.productType],
              ["Shirt type", specs.shirtType],
              ["Unit size", `${product.unitSize.toLocaleString("en-IN")} pieces`],
            ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-cavree-primary" />
                <span className="text-cavree-muted">{label}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <PackageCheck size={15} className="text-cavree-primary" />
              <span className="text-cavree-muted">Stock:</span>
              <span className="font-medium">{product.availableUnits > 0 ? "Available" : "Out of stock"}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
