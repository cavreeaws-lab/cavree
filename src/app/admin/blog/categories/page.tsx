"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  useEffect(() => {
    fetch("/api/admin/blog/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load categories")
        setLoading(false)
      })
  }, [])

  async function createCategory(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/blog/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    })
    if (res.ok) {
      toast.success("Category created")
      setName("")
      setSlug("")
      const refreshed = await fetch("/api/admin/blog/categories").then((r) => r.json())
      setCategories(refreshed.categories || [])
    } else {
      toast.error("Failed to create category")
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return
    const res = await fetch(`/api/admin/blog/categories/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Category deleted")
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Blog Categories</h1>

      <form onSubmit={createCategory} className="border rounded-lg p-4 mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
          <input placeholder="Slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm">Create Category</button>
      </form>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Slug</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="px-4 py-2 font-medium">{cat.name}</td>
                <td className="px-4 py-2 text-gray-500">{cat.slug}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => deleteCategory(cat.id)} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
