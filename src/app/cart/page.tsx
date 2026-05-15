"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/hooks/useCart"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart()

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
  const total = subtotal + shipping

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
                      item.product.variant?.price || item.product.price
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
                      (item.product.variant?.price || item.product.price) * item.quantity
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
          <div className="border border-cavree-border rounded-lg p-6">
            <h2 className="font-playfair text-xl font-bold mb-4">Order Summary</h2>
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
