"use client"

import { useEffect, useState } from "react"
import { CreditCard, IndianRupee, Package, Wallet } from "lucide-react"
import toast from "react-hot-toast"

export default function FranchiseWalletPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders?limit=100").then((res) => res.json()),
      fetch("/api/admin/payouts?limit=20").then((res) => res.json()),
    ])
      .then(([ordersData, payoutsData]) => {
        setOrders(ordersData.orders || [])
        setPayouts(payoutsData.payouts || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load wallet")
        setLoading(false)
      })
  }, [])

  const grossSales = orders
    .filter((order) => !["CANCELLED", "RETURNED", "REFUNDED"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0)
  const completedPayments = orders
    .filter((order) => order.payment?.status === "COMPLETED")
    .reduce((sum, order) => sum + order.total, 0)
  const pendingPayments = orders
    .filter((order) => order.payment?.status === "PENDING")
    .reduce((sum, order) => sum + order.total, 0)
  const commissionRate = (orders[0]?.franchise?.commission ?? 10) / 100
  const estimatedCommission = grossSales * commissionRate
  const requestedPayouts = payouts
    .filter((payout) => ["PENDING", "APPROVED", "PAID"].includes(payout.status))
    .reduce((sum, payout) => sum + payout.amount, 0)
  const availableForPayout = Math.max(0, completedPayments - completedPayments * commissionRate - requestedPayouts)

  const cards = [
    { label: "Gross Sales", value: grossSales, icon: IndianRupee },
    { label: "Completed Payments", value: completedPayments, icon: CreditCard },
    { label: "Pending Payments", value: pendingPayments, icon: Package },
    { label: "Estimated Commission", value: estimatedCommission, icon: Wallet },
    { label: "Available Payout", value: availableForPayout, icon: Wallet },
  ]

  const requestPayout = async () => {
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    setRequesting(true)
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount, method: "BANK_TRANSFER" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to request payout")
        return
      }
      setPayouts((prev) => [data.payout, ...prev])
      setAmount("")
      toast.success("Payout requested")
    } catch {
      toast.error("Failed to request payout")
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-bold">Franchise Wallet</h2>
        <p className="text-sm text-cavree-muted font-poppins mt-1">Track payments, estimated commission, and payout requests.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-cavree-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cavree-muted font-poppins">{card.label}</p>
                <p className="font-montserrat text-2xl font-bold mt-1">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(card.value)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center">
                <card.icon size={20} className="text-cavree-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-cavree-border rounded-lg p-6">
        <h3 className="font-playfair text-lg font-bold">Request Payout</h3>
        <p className="mt-1 text-sm text-cavree-muted font-poppins">Available balance excludes estimated commission and existing payout requests.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="input max-w-xs" />
          <button onClick={requestPayout} disabled={requesting} className="rounded-md bg-cavree-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {requesting ? "Requesting..." : "Request Payout"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg">
        <div className="px-6 py-4 border-b border-cavree-border">
          <h3 className="font-playfair text-lg font-bold">Payout Requests</h3>
        </div>
        {payouts.length === 0 ? (
          <p className="p-6 text-sm text-cavree-muted font-poppins">No payout requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cavree-light">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Method</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cavree-border">
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="px-6 py-4 text-sm font-medium">{new Date(payout.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-6 py-4 text-sm font-poppins">{payout.method || "BANK_TRANSFER"}</td>
                    <td className="px-6 py-4 text-sm font-poppins">{payout.status}</td>
                    <td className="px-6 py-4 text-sm font-medium text-right">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(payout.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
