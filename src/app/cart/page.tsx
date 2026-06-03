"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle, Store } from "lucide-react"
import toast from "react-hot-toast"

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]

function sizeRank(size?: string) {
  const index = SIZE_ORDER.indexOf(size || "")
  return index === -1 ? SIZE_ORDER.length : index
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, updateVariant, getTotalPrice, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [productDetails, setProductDetails] = useState<Record<string, any>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const slugs = Array.from(new Set(items.map((item) => item.product.slug).filter(Boolean)))
    const missingSlugs = slugs.filter((slug) => !productDetails[slug])
    if (missingSlugs.length === 0) return

    let cancelled = false
    Promise.all(
      missingSlugs.map((slug) =>
        fetch(`/api/products/${slug}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => [slug, data?.product || null] as const)
          .catch(() => [slug, null] as const)
      )
    ).then((entries) => {
      if (cancelled) return
      setProductDetails((current) => {
        const next = { ...current }
        entries.forEach(([slug, product]) => {
          if (product) next[slug] = product
        })
        return next
      })
    })

    return () => {
      cancelled = true
    }
  }, [items, productDetails, mounted])

  const getVariantsForItem = (item: any) => {
    const variants = productDetails[item.product.slug]?.variants || item.product.variants || []
    return variants
      .slice()
      .sort((a: any, b: any) => sizeRank(a.size) - sizeRank(b.size) || (a.size || "").localeCompare(b.size || ""))
  }

  const cartIssues = useMemo(() => {
    return items.flatMap((item) => {
      const variants = getVariantsForItem(item)
      if (variants.length === 0) return []
      const selectedVariant = variants.find((variant: any) => variant.id === item.product.variant?.id)
      if (!selectedVariant) return [`Please select a size for ${item.product.name}`]
      if ((selectedVariant.quantity ?? 0) < item.quantity) {
        return [`${item.product.name} has only ${selectedVariant.quantity ?? 0} units available in ${selectedVariant.size || "selected size"}`]
      }
      return []
    })
  }, [items, productDetails])

  const canCheckout = cartIssues.length === 0

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-playfair text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="h-48 rounded-lg border border-cavree-border animate-pulse bg-cavree-light" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-cavree-muted-light" />
        <h1 className="font-playfair text-2xl font-bold mt-6">Your Cart is Empty</h1>
        <p className="text-cavree-muted mt-2 font-poppins">Discover our luxury collection and add your favorites.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 bg-cavree-primary text-white px-6 py-3 rounded-md font-medium hover:bg-cavree-primary-light transition-colors"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0
  const total = Math.max(0, subtotal - discount)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), total: subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Invalid coupon")
        return
      }
      setAppliedCoupon({ code: couponCode.trim(), discount: data.discount })
      toast.success(`Coupon applied: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(data.discount)} off`)
    } catch {
      toast.error("Failed to apply coupon")
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-playfair text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="border border-cavree-border rounded-lg overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border-b border-cavree-border last:border-b-0">
                <Link href={`/product/${item.product.slug}`} className="relative w-24 h-32 flex-shrink-0 rounded-md overflow-hidden bg-cavree-light">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.slug}`}>
                    <h3 className="font-playfair font-semibold text-base truncate">{item.product.name}</h3>
                  </Link>
                  {item.franchiseName && (
                    <p className="text-xs text-cavree-primary font-poppins mt-0.5 flex items-center gap-1">
                      <Store size={12} /> From {item.franchiseName}
                    </p>
                  )}
                  {item.product.variant && (
                    <p className="text-sm text-cavree-muted font-poppins mt-0.5">
                      {item.product.variant.size} {item.product.variant.color}
                    </p>
                  )}
                  {getVariantsForItem(item).length > 0 && (
                    <div className="mt-2 max-w-xs">
                      <label className="block text-xs font-medium text-cavree-muted mb-1">Size</label>
                      <select
                        value={item.product.variant?.id || ""}
                        onChange={(event) => {
                          const variant = getVariantsForItem(item).find((entry: any) => entry.id === event.target.value)
                          if (!variant) return
                          updateVariant(item.id, {
                            id: variant.id,
                            size: variant.size,
                            color: variant.color,
                            price: variant.price,
                            quantity: variant.quantity,
                          })
                        }}
                        className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary"
                      >
                        <option value="">Select size</option>
                        {getVariantsForItem(item).map((variant: any) => (
                          <option key={variant.id} value={variant.id} disabled={(variant.quantity ?? 0) <= 0}>
                            {variant.size || variant.color || "One size"} {(variant.quantity ?? 0) <= 0 ? "(Out of stock)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <p className="font-montserrat font-semibold mt-2">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                      item.product.variant?.price ?? item.product.price
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-cavree-border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-cavree-light transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-cavree-light transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-cavree-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-montserrat font-semibold">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                      (item.product.variant?.price ?? item.product.price) * item.quantity
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <Link href="/shop" className="text-sm text-cavree-primary hover:underline font-poppins">
              Continue Shopping
            </Link>
            <button onClick={clearCart} className="text-sm text-red-500 hover:underline font-poppins">
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="border border-cavree-border rounded-lg p-6 lg:sticky lg:top-24">
            <h2 className="font-playfair text-xl font-bold mb-4">Order Summary</h2>
            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  disabled={!!appliedCoupon}
                  className="w-full border border-cavree-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-cavree-primary disabled:bg-cavree-light"
                />
              </div>
              {appliedCoupon ? (
                <button onClick={handleRemoveCoupon} className="text-red-500 text-sm font-medium hover:underline px-2">Remove</button>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light disabled:opacity-50"
                >
                  {applyingCoupon ? "..." : "Apply"}
                </button>
              )}
            </div>
            {appliedCoupon && (
              <div className="flex items-center gap-1 text-sm text-green-600 font-poppins mb-3">
                <CheckCircle size={14} /> Coupon <strong>{appliedCoupon.code}</strong> applied
              </div>
            )}

            <div className="space-y-3 text-sm font-poppins">
              <div className="flex justify-between">
                <span className="text-cavree-muted">Subtotal</span>
                <span className="font-medium">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">Discount</span>
                  <span className="font-medium">-{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(discount)}</span>
                </div>
              )}
              <div className="border-t border-cavree-border pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-montserrat font-bold text-lg">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(total)}
                </span>
              </div>
            </div>
            {cartIssues.length > 0 && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 font-poppins space-y-1">
                {cartIssues.map((issue) => (
                  <p key={issue}>{issue}</p>
                ))}
              </div>
            )}
            {canCheckout ? (
              <Link
                href="/checkout"
                className="mt-6 w-full bg-cavree-primary hover:bg-cavree-primary-light text-white py-3.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => toast.error("Please fix cart size selections before checkout")}
                className="mt-6 w-full bg-cavree-primary/60 text-white py-3.5 rounded-md font-medium flex items-center justify-center gap-2 cursor-not-allowed"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
