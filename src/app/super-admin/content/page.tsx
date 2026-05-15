"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function SuperAdminContentPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ key: "", type: "TEXT", content: "", isActive: true })
  const [editing, setEditing] = useState<string | null>(null)

  const fetchBlocks = () => {
    fetch("/api/super-admin/content")
      .then((res) => res.json())
      .then((data) => { setBlocks(data.blocks || []); setLoading(false) })
      .catch(() => { toast.error("Failed to load content"); setLoading(false) })
  }

  useEffect(() => { fetchBlocks() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/super-admin/content/${editing}` : "/api/super-admin/content"
    const method = editing ? "PUT" : "POST"
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error("Failed")
      toast.success(editing ? "Content updated" : "Content created")
      setShowForm(false)
      setForm({ key: "", type: "TEXT", content: "", isActive: true })
      setEditing(null)
      fetchBlocks()
    } catch {
      toast.error("Failed to save content")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content block?")) return
    try {
      const res = await fetch(`/api/super-admin/content/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Content deleted")
      fetchBlocks()
    } catch {
      toast.error("Failed to delete")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Content</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">Content</h2>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ key: "", type: "TEXT", content: "", isActive: true }) }} className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light">
          {showForm ? "Cancel" : "Add Content"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-cavree-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <input placeholder="Key" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary">
              <option value="TEXT">Text</option>
              <option value="HTML">HTML</option>
              <option value="IMAGE">Image</option>
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          </div>
          <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary resize-none" />
          <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium">{editing ? "Update" : "Create"}</button>
        </form>
      )}

      <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Key</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Type</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Status</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Actions</th></tr></thead>
          <tbody className="divide-y divide-cavree-border">
            {blocks.map((b: any) => (
              <tr key={b.id} className="hover:bg-cavree-light/50">
                <td className="px-6 py-4 text-sm font-medium">{b.key}</td>
                <td className="px-6 py-4 text-sm font-poppins">{b.type}</td>
                <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${b.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{b.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => { setEditing(b.id); setForm({ key: b.key, type: b.type, content: b.content || "", isActive: b.isActive }); setShowForm(true) }} className="text-sm text-cavree-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
