"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, MapPin, Package, User, Calendar, StickyNote } from "lucide-react"
import toast from "react-hot-toast"

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState("")
  const [addingNote, setAddingNote] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/customers/${customerId}`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { toast.error("Failed to load customer"); setLoading(false) })
  }, [customerId])

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText }),
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      setData((prev: any) => ({ ...prev, notes: [d.note, ...prev.notes] }))
      setNoteText("")
      toast.success("Note added")
    } catch {
      toast.error("Failed to add note")
    } finally {
      setAddingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3" />
        <div className="animate-pulse h-40 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!data?.customer) {
    return (
      <div className="text-center py-16">
        <p className="text-cavree-muted font-poppins">Customer not found</p>
        <Link href="/admin/customers" className="mt-4 inline-flex items-center gap-1 text-cavree-primary hover:underline">
          <ChevronLeft size={16} /> Back to Customers
        </Link>
      </div>
    )
  }

  const c = data.customer

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-cavree-muted hover:text-cavree-primary mb-2">
          <ChevronLeft size={16} /> Back to Customers
        </Link>
        <h2 className="font-playfair text-xl font-bold flex items-center gap-2">
          <User size={20} /> {c.name || "Unnamed"}
        </h2>
        <p className="text-sm text-cavree-muted font-poppins">{c.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-cavree-border rounded-lg p-5">
          <p className="text-sm text-cavree-muted font-poppins">Total Spent</p>
          <p className="font-montserrat text-2xl font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(c.totalSpent)}</p>
        </div>
        <div className="bg-white border border-cavree-border rounded-lg p-5">
          <p className="text-sm text-cavree-muted font-poppins">Orders</p>
          <p className="font-montserrat text-2xl font-bold">{c.orderCount}</p>
        </div>
        <div className="bg-white border border-cavree-border rounded-lg p-5">
          <p className="text-sm text-cavree-muted font-poppins">Phone</p>
          <p className="font-montserrat text-lg font-bold">{c.phone || "-"}</p>
        </div>
        <div className="bg-white border border-cavree-border rounded-lg p-5">
          <p className="text-sm text-cavree-muted font-poppins">Registered</p>
          <p className="font-montserrat text-lg font-bold">{new Date(c.createdAt).toLocaleDateString("en-IN")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-playfair text-lg font-bold mb-4 flex items-center gap-2"><Package size={18} /> Recent Orders</h3>
          {data.orders?.length > 0 ? (
            <div className="space-y-3">
              {data.orders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between text-sm font-poppins border-b border-cavree-border last:border-b-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium">{o.orderNumber}</p>
                    <p className="text-cavree-muted">{o.status} · {new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <p className="font-medium">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(o.total)}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-cavree-muted text-sm">No orders yet.</p>}
        </div>

        <div className="bg-white border border-cavree-border rounded-lg p-6">
          <h3 className="font-playfair text-lg font-bold mb-4 flex items-center gap-2"><MapPin size={18} /> Addresses</h3>
          {data.addresses?.length > 0 ? (
            <div className="space-y-3">
              {data.addresses.map((a: any) => (
                <div key={a.id} className="text-sm font-poppins border-b border-cavree-border last:border-b-0 pb-3 last:pb-0">
                  <p className="font-medium">{a.name}</p>
                  <p className="text-cavree-muted">{a.address}, {a.city}, {a.state} - {a.pincode}</p>
                  <p className="text-cavree-muted">{a.phone}</p>
                  {a.isDefault && <span className="text-xs text-cavree-primary font-medium">Default</span>}
                </div>
              ))}
            </div>
          ) : <p className="text-cavree-muted text-sm">No saved addresses.</p>}
        </div>
      </div>

      <div className="bg-white border border-cavree-border rounded-lg p-6">
        <h3 className="font-playfair text-lg font-bold mb-4 flex items-center gap-2"><StickyNote size={18} /> Notes</h3>
        <div className="flex gap-2 mb-4">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary"
          />
          <button
            onClick={handleAddNote}
            disabled={addingNote || !noteText.trim()}
            className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light disabled:opacity-50"
          >
            {addingNote ? "Adding..." : "Add"}
          </button>
        </div>
        {data.notes?.length > 0 ? (
          <div className="space-y-3">
            {data.notes.map((n: any) => (
              <div key={n.id} className="text-sm font-poppins border-b border-cavree-border last:border-b-0 pb-3 last:pb-0">
                <p>{n.note}</p>
                <p className="text-xs text-cavree-muted">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-cavree-muted text-sm">No notes yet.</p>}
      </div>
    </div>
  )
}
