"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { ChevronRight, CreditCard, Truck, CheckCircle, Loader2, MapPin, Plus, X, CalendarDays } from "lucide-react"
import toast from "react-hot-toast"

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("COD")
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "", isDefault: false })
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const subtotal = getTotalPrice()
  const shipping = subtotal > 5000 ? 0 : 150
  const tax = Math.round(subtotal * 0.05) // 5% GST placeholder
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0
  const total = subtotal + shipping + tax - discount

  const estimatedDelivery = () => {
    const d = new Date()
    d.setDate(d.getDate() + 5)
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/checkout")
      return
    }
    if (authLoading || !user) return

    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses) {
          setAddresses(data.addresses)
          const defaultAddr = data.addresses.find((a: any) => a.isDefault)
          if (defaultAddr) setSelectedAddress(defaultAddr.id)
        }
      })
      .catch(() => toast.error("Failed to load addresses"))
  }, [authLoading, router, user])

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-playfair text-2xl font-bold">Your Cart is Empty</h1>
        <Link href="/shop" className="mt-4 inline-block text-cavree-primary hover:underline">
          Back to Shop
        </Link>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address")
      return
    }

    setPlacingOrder(true)
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        variantId: item.product.variant?.id,
      }))

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          addressId: selectedAddress,
          paymentMethod,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to place order")
        setPlacingOrder(false)
        return
      }

      if (paymentMethod === "RAZORPAY") {
        // Initiate Razorpay payment
        const payRes = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.order.id }),
        })
        const payData = await payRes.json()
        if (!payRes.ok) {
          toast.error(payData.error || "Payment initiation failed")
          setPlacingOrder(false)
          return
        }

        const options = {
          key: payData.keyId,
          amount: payData.amount,
          currency: payData.currency,
          name: "Cavree",
          description: `Order ${data.order.orderNumber}`,
          order_id: payData.orderId,
          handler: async (response: any) => {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              setPlacingOrder(false)
              clearCart()
              router.push(`/checkout/success?order=${data.order.orderNumber}`)
            } else {
              toast.error("Payment verification failed")
              setPlacingOrder(false)
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
          },
          theme: { color: "#0E7B87" },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
        rzp.on("payment.failed", () => {
          toast.error("Payment failed")
          setPlacingOrder(false)
        })
      } else {
        // COD
        setPlacingOrder(false)
        clearCart()
        router.push(`/checkout/success?order=${data.order.orderNumber}`)
      }
    } catch (error) {
      toast.error("Something went wrong")
      setPlacingOrder(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-cavree-muted font-poppins mb-8">
        <Link href="/cart" className="hover:text-cavree-primary">Cart</Link>
        <ChevronRight size={14} className="inline mx-1" />
        <span>Checkout</span>
      </div>

      <h1 className="font-playfair text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        {["Shipping", "Payment", "Review"].map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > idx + 1 ? "bg-cavree-primary text-white" : step === idx + 1 ? "bg-cavree-primary text-white" : "bg-cavree-border text-cavree-muted"}`}>
              {step > idx + 1 ? <CheckCircle size={16} /> : idx + 1}
            </div>
            <span className={`text-sm font-medium ${step >= idx + 1 ? "text-cavree-foreground" : "text-cavree-muted"}`}>{label}</span>
            {idx < 2 && <div className={`w-8 h-0.5 ${step > idx + 1 ? "bg-cavree-primary" : "bg-cavree-border"}`} />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {step === 1 && (
            <div className="border border-cavree-border rounded-lg p-6">
              <h2 className="font-playfair text-xl font-bold mb-4">Shipping Address</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-cavree-muted font-poppins mb-4">No saved addresses</p>
                  <Link href="/account/addresses" className="inline-block bg-cavree-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-cavree-primary-light transition-colors">
                    Add New Address
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddress === addr.id ? "border-cavree-primary bg-cavree-primary/5" : "border-cavree-border"}`}>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1"
                      />
                      <div className="text-sm font-poppins">
                        <p className="font-medium">{addr.name}</p>
                        <p className="text-cavree-muted">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-cavree-muted">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowAddressModal(true)}
                className="mt-4 w-full border border-cavree-border py-2.5 rounded-md text-sm font-medium hover:bg-cavree-light transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add New Address
              </button>
              <button
                onClick={() => {
                  if (!selectedAddress) {
                    toast.error("Please select an address")
                    return
                  }
                  setStep(2)
                }}
                className="mt-4 w-full bg-cavree-primary hover:bg-cavree-primary-light text-white py-3 rounded-md font-medium transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="border border-cavree-border rounded-lg p-6">
              <h2 className="font-playfair text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "RAZORPAY" ? "border-cavree-primary bg-cavree-primary/5" : "border-cavree-border"}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "RAZORPAY"}
                    onChange={() => setPaymentMethod("RAZORPAY")}
                  />
                  <CreditCard size={24} className="text-cavree-primary" />
                  <div className="text-sm font-poppins">
                    <p className="font-medium">Razorpay</p>
                    <p className="text-cavree-muted">Credit/Debit Card, UPI, Net Banking</p>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "COD" ? "border-cavree-primary bg-cavree-primary/5" : "border-cavree-border"}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <Truck size={24} className="text-cavree-primary" />
                  <div className="text-sm font-poppins">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-cavree-muted">Pay when you receive your order</p>
                  </div>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-cavree-border py-3 rounded-md font-medium hover:bg-cavree-light transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-cavree-primary hover:bg-cavree-primary-light text-white py-3 rounded-md font-medium transition-colors"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="border border-cavree-border rounded-lg p-6">
              <h2 className="font-playfair text-xl font-bold mb-4">Review Your Order</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm font-poppins">
                    <div>
                      <p className="font-medium">{item.product.name} x {item.quantity}</p>
                      {item.product.variant && (
                        <p className="text-cavree-muted text-xs">{item.product.variant.size} {item.product.variant.color}</p>
                      )}
                    </div>
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                        (item.product.variant?.price ?? item.product.price) * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-cavree-border mt-4 pt-4 space-y-2 text-sm font-poppins">
                <div className="flex justify-between">
                  <span className="text-cavree-muted">Subtotal</span>
                  <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cavree-muted">Shipping</span>
                  <span>{shipping === 0 ? "FREE" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cavree-muted">Tax (5% GST)</span>
                  <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Discount</span>
                    <span className="font-medium">-{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="font-montserrat text-lg">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(total)}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-cavree-border py-3 rounded-md font-medium hover:bg-cavree-light transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="flex-1 bg-cavree-primary hover:bg-cavree-primary-light disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="border border-cavree-border rounded-lg p-6">
            <h2 className="font-playfair text-lg font-bold mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  disabled={!!appliedCoupon}
                  className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary disabled:bg-cavree-light"
                />
              </div>
              {appliedCoupon ? (
                <button onClick={() => { setAppliedCoupon(null); setCouponCode("") }} className="text-red-500 text-sm font-medium hover:underline px-2">Remove</button>
              ) : (
                <button
                  onClick={async () => {
                    if (!couponCode.trim()) return
                    setApplyingCoupon(true)
                    try {
                      const res = await fetch("/api/coupons/validate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: couponCode.trim(), total: subtotal }),
                      })
                      const data = await res.json()
                      if (!res.ok) { toast.error(data.error || "Invalid coupon"); return }
                      setAppliedCoupon({ code: couponCode.trim(), discount: data.discount })
                      toast.success(`Coupon applied: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(data.discount)} off`)
                    } catch { toast.error("Failed to apply coupon") }
                    finally { setApplyingCoupon(false) }
                  }}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light disabled:opacity-50"
                >
                  {applyingCoupon ? "..." : "Apply"}
                </button>
              )}
            </div>

            <div className="space-y-2 text-sm font-poppins">
              <div className="flex justify-between">
                <span className="text-cavree-muted">Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cavree-muted">Subtotal</span>
                <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cavree-muted">Shipping</span>
                <span>{shipping === 0 ? "FREE" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cavree-muted">Tax (5% GST)</span>
                <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">Discount</span>
                  <span className="font-medium">-{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(discount)}</span>
                </div>
              )}
              <div className="border-t border-cavree-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-montserrat">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(total)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-cavree-muted font-poppins">
              <CalendarDays size={14} /> Estimated delivery by {estimatedDelivery()}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddressModal(false)} className="absolute right-4 top-4 text-cavree-muted hover:text-cavree-foreground">
              <X size={20} />
            </button>
            <h3 className="font-playfair text-lg font-bold mb-4 flex items-center gap-2"><MapPin size={18} /> Add Address</h3>
            <div className="space-y-3 font-poppins text-sm">
              {["name","phone","address","city","state","pincode"].map((field) => (
                <div key={field}>
                  <label className="block text-xs text-cavree-muted mb-1 capitalize">{field}</label>
                  <input
                    value={(addressForm as any)[field]}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full border border-cavree-border rounded-md px-3 py-2 outline-none focus:border-cavree-primary"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                />
                <span className="text-sm">Set as default</span>
              </label>
            </div>
            <button
              onClick={async () => {
                setSavingAddress(true)
                try {
                  const res = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addressForm) })
                  const data = await res.json()
                  if (!res.ok) { toast.error(data.error || "Failed to save"); return }
                  setAddresses((prev) => [...prev, data.address])
                  setSelectedAddress(data.address.id)
                  setShowAddressModal(false)
                  setAddressForm({ name: "", phone: "", address: "", city: "", state: "", pincode: "", isDefault: false })
                  toast.success("Address added")
                } catch { toast.error("Failed to save") }
                finally { setSavingAddress(false) }
              }}
              disabled={savingAddress}
              className="mt-4 w-full bg-cavree-primary hover:bg-cavree-primary-light text-white py-2.5 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {savingAddress ? "Saving..." : "Save Address"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
