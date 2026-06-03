"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function FranchiseCheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    franchiseCode: "",
    password: "",
    paymentMethod: "BANK_TRANSFER",
    deliveryName: "",
    deliveryPhone: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    notes: "",
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/franchise/cart").then((res) => res.json()),
      fetch("/api/franchise/dashboard").then((res) => res.json()),
    ]).then(([cartData, dashboardData]) => {
      setCart(cartData)
      const nextProfile = dashboardData.profile || {}
      setProfile(nextProfile)
      setForm((prev) => ({
        ...prev,
        franchiseCode: nextProfile.franchiseCode || prev.franchiseCode,
        deliveryName: nextProfile.ownerName || nextProfile.name || prev.deliveryName,
        deliveryPhone: nextProfile.phone || prev.deliveryPhone,
        deliveryCity: nextProfile.city || prev.deliveryCity,
        deliveryState: nextProfile.state || prev.deliveryState,
      }))
    }).catch(() => toast.error("Failed to load checkout details"))
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    const res = await fetch("/api/franchise/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      toast.error(data.error || "Checkout failed")
      return
    }
    toast.success("Bulk order placed")
    router.push(`/franchise/orders/${data.order.id}`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-cavree-border bg-white p-6">
        <h2 className="font-playfair text-2xl font-bold">Franchise Checkout</h2>
        <p className="mt-1 text-sm text-cavree-muted">Verify the franchise account before placing the bulk order.</p>
        {profile && (
          <div className="mt-4 rounded-md bg-cavree-light p-3 text-sm">
            <p className="font-medium">{profile.name}</p>
            <p className="text-cavree-muted">{profile.franchiseCode} · {profile.status}</p>
          </div>
        )}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">Franchise Unique ID
              <input required value={form.franchiseCode} onChange={(e) => setForm({ ...form, franchiseCode: e.target.value })} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 outline-none focus:border-cavree-primary" />
            </label>
            <label className="text-sm font-medium">Password
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 outline-none focus:border-cavree-primary" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">Delivery Name
              <input value={form.deliveryName} onChange={(e) => setForm({ ...form, deliveryName: e.target.value })} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 outline-none focus:border-cavree-primary" />
            </label>
            <label className="text-sm font-medium">Phone
              <input value={form.deliveryPhone} onChange={(e) => setForm({ ...form, deliveryPhone: e.target.value })} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 outline-none focus:border-cavree-primary" />
            </label>
          </div>
          <label className="block text-sm font-medium">Delivery Address
            <textarea value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} rows={3} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 outline-none focus:border-cavree-primary" />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-medium">City
              <input value={form.deliveryCity} onChange={(e) => setForm({ ...form, deliveryCity: e.target.value })} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 outline-none focus:border-cavree-primary" />
            </label>
            <label className="text-sm font-medium">State
              <input value={form.deliveryState} onChange={(e) => setForm({ ...form, deliveryState: e.target.value })} className="mt-1 w-full rounded-md border border-cavree-border px-3 py-2 outline-none focus:border-cavree-primary" />
            </label>
            <label className="text-sm font-medium">Payment
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="mt-1 w-full rounded-md border border-cavree-border bg-white px-3 py-2 outline-none focus:border-cavree-primary">
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="COD">Pay Later</option>
              </select>
            </label>
          </div>
          <button disabled={loading} className="rounded-md bg-cavree-primary px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
            {loading ? "Placing order..." : "Place Bulk Order"}
          </button>
        </form>
      </div>
      <aside className="h-fit rounded-lg border border-cavree-border bg-white p-5">
        <h3 className="font-playfair text-lg font-bold">Order Summary</h3>
        <div className="mt-4 space-y-3 text-sm">
          {(cart?.cart?.items || []).map((item: any) => (
            <div key={item.id} className="border-b border-cavree-border pb-3">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-xs text-cavree-muted">{item.unitCount} units · {(item.unitCount * item.unitSize).toLocaleString("en-IN")} pieces</p>
              <p className="mt-1 font-semibold">₹{item.total.toLocaleString("en-IN")}</p>
            </div>
          ))}
          <div className="flex justify-between"><span>Units</span><span>{cart?.summary?.totalUnits || 0}</span></div>
          <div className="flex justify-between"><span>Pieces</span><span>{cart?.summary?.totalPieces?.toLocaleString("en-IN") || 0}</span></div>
          <div className="flex justify-between"><span>Subtotal</span><span>₹{(cart?.summary?.subtotal || 0).toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>GST</span><span>₹{(cart?.summary?.tax || 0).toLocaleString("en-IN")}</span></div>
          <div className="border-t border-cavree-border pt-3 text-base font-semibold flex justify-between"><span>Total</span><span>₹{(cart?.summary?.total || 0).toLocaleString("en-IN")}</span></div>
        </div>
      </aside>
    </div>
  )
}
