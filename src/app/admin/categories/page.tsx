"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "", description: "" })
  const [editing, setEditing] = useState<string | null>(null)

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => { setCategories(data.categories || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load categories"); setLoading(false) })
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/admin/categories/${editing}` : "/api/admin/categories"
    const method = editing ? "PUT" : "POST"
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error("Failed")
      toast.success(editing ? "Category updated" : "Category created")
      setShowForm(false)
      setForm({ name: "", slug: "", description: "" })
      setEditing(null)
      fetchCategories()
    } catch {
      toast.error("Failed to save category")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Category deleted")
      fetchCategories()
    } catch {
      toast.error("Failed to delete")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Categories</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">Categories</h2>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", slug: "", description: "" }) }} className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light">
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-cavree-border rounded-lg p-4 grid grid-cols-3 gap-4">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <div className="col-span-3 flex gap-2">
            <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium">{editing ? "Update" : "Create"}</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Name</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Slug</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Products</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Actions</th></tr></thead>
          <tbody className="divide-y divide-cavree-border">
            {categories.map((c: any) => (
              <tr key={c.id} className="hover:bg-cavree-light/50">
                <td className="px-6 py-4 text-sm font-medium">{c.name}</td>
                <td className="px-6 py-4 text-sm font-poppins">{c.slug}</td>
                <td className="px-6 py-4 text-sm font-poppins">{c._count?.products || 0}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => { setEditing(c.id); setForm({ name: c.name, slug: c.slug, description: c.description || "" }); setShowForm(true) }} className="text-sm text-cavree-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
