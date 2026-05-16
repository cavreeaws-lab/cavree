"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

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
  const shipping = subtotal > 5000 ? 0 : 150
  const tax = Math.round(subtotal * 0.05)
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0
  const total = subtotal + shipping + tax - discount

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
                  {item.product.variant && (
                    <p className="text-sm text-cavree-muted font-poppins mt-0.5">
                      {item.product.variant.size} {item.product.variant.color}
                    </p>
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
              <div className="flex justify-between">
                <span className="text-cavree-muted">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "FREE" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cavree-muted">Tax (5% GST)</span>
                <span className="font-medium">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(tax)}</span>
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
            {subtotal < 5000 && (
              <p className="text-xs text-cavree-muted mt-3 font-poppins">
                Add {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(5000 - subtotal)} more for free shipping
              </p>
            )}
            <Link
              href="/checkout"
              className="mt-6 w-full bg-cavree-primary hover:bg-cavree-primary-light text-white py-3.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
