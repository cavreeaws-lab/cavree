"use client"

import { useEffect, useState } from "react"
import { MapPin, Plus, Trash2, Star, X, Check } from "lucide-react"
import toast from "react-hot-toast"

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  type: string
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
    type: "HOME",
  })

  const fetchAddresses = () => {
    setLoading(true)
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load addresses")
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: false,
      type: "HOME",
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success(editingId ? "Address updated" : "Address added")
      resetForm()
      fetchAddresses()
    } catch {
      toast.error("Failed to save address")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Address deleted")
      fetchAddresses()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleEdit = (addr: Address) => {
    setFormData({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      isDefault: addr.isDefault,
      type: addr.type,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse border border-cavree-border rounded-lg p-6">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">My Addresses</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light transition-colors"
          >
            <Plus size={16} />
            Add New
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-cavree-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-montserrat font-semibold">{editingId ? "Edit Address" : "New Address"}</h3>
            <button type="button" onClick={resetForm} className="text-cavree-muted hover:text-cavree-foreground">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border border-cavree-border rounded-md px-4 py-2.5 text-sm outline-none focus:border-cavree-primary" />
            <input required placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="border border-cavree-border rounded-md px-4 py-2.5 text-sm outline-none focus:border-cavree-primary" />
            <input required placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="border border-cavree-border rounded-md px-4 py-2.5 text-sm outline-none focus:border-cavree-primary sm:col-span-2" />
            <input required placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="border border-cavree-border rounded-md px-4 py-2.5 text-sm outline-none focus:border-cavree-primary" />
            <input required placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="border border-cavree-border rounded-md px-4 py-2.5 text-sm outline-none focus:border-cavree-primary" />
            <input required placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="border border-cavree-border rounded-md px-4 py-2.5 text-sm outline-none focus:border-cavree-primary" />
            <input placeholder="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="border border-cavree-border rounded-md px-4 py-2.5 text-sm outline-none focus:border-cavree-primary" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
              Set as default
            </label>
          </div>
          <button type="submit" className="bg-cavree-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-cavree-primary-light transition-colors flex items-center gap-2">
            <Check size={16} /> {editingId ? "Update" : "Save"}
          </button>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-16 border border-cavree-border rounded-lg">
          <MapPin size={48} className="mx-auto text-cavree-muted-light" />
          <h3 className="font-playfair text-lg font-bold mt-4">No Saved Addresses</h3>
          <p className="text-cavree-muted mt-1 font-poppins text-sm">Add your delivery addresses here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`border rounded-lg p-5 relative ${addr.isDefault ? "border-cavree-primary bg-cavree-primary/5" : "border-cavree-border"}`}>
              {addr.isDefault && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-cavree-primary">
                  <Star size={12} /> Default
                </span>
              )}
              <p className="font-medium text-sm">{addr.name}</p>
              <p className="text-sm text-cavree-muted font-poppins mt-1">{addr.address}</p>
              <p className="text-sm text-cavree-muted font-poppins">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-sm text-cavree-muted font-poppins">{addr.country}</p>
              <p className="text-sm text-cavree-muted font-poppins mt-1">{addr.phone}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleEdit(addr)} className="text-sm text-cavree-primary hover:underline">Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="text-sm text-red-500 hover:underline flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
