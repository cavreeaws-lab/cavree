"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminContentPage() {
  const [tab, setTab] = useState<"blocks" | "banners" | "pages">("blocks")
  const [blocks, setBlocks] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  // Block form
  const [blockForm, setBlockForm] = useState({ key: "", type: "TEXT", content: "", isActive: true })

  // Banner form
  const [bannerForm, setBannerForm] = useState({ title: "", image: "", link: "", position: "HOME_TOP", sortOrder: 0, isActive: true })

  // Page form
  const [pageForm, setPageForm] = useState({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isActive: true })

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/admin/content").then((r) => r.json()),
      fetch("/api/admin/content/banners").then((r) => r.json()),
      fetch("/api/admin/content/pages").then((r) => r.json()),
    ])
      .then(([b, bn, p]) => {
        setBlocks(b.blocks || [])
        setBanners(bn.banners || [])
        setPages(p.pages || [])
        setLoading(false)
      })
      .catch(() => { toast.error("Failed to load content"); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/admin/content/${editing}` : "/api/admin/content"
    const method = editing ? "PUT" : "POST"
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(blockForm) })
      if (!res.ok) throw new Error("Failed")
      toast.success(editing ? "Content updated" : "Content created")
      setShowForm(false); setEditing(null); setBlockForm({ key: "", type: "TEXT", content: "", isActive: true })
      fetchData()
    } catch { toast.error("Failed to save") }
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/admin/content/banners/${editing}` : "/api/admin/content/banners"
    const method = editing ? "PUT" : "POST"
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(bannerForm) })
      if (!res.ok) throw new Error("Failed")
      toast.success(editing ? "Banner updated" : "Banner created")
      setShowForm(false); setEditing(null); setBannerForm({ title: "", image: "", link: "", position: "HOME_TOP", sortOrder: 0, isActive: true })
      fetchData()
    } catch { toast.error("Failed to save") }
  }

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/admin/content/pages/${editing}` : "/api/admin/content/pages"
    const method = editing ? "PUT" : "POST"
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(pageForm) })
      if (!res.ok) throw new Error("Failed")
      toast.success(editing ? "Page updated" : "Page created")
      setShowForm(false); setEditing(null); setPageForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isActive: true })
      fetchData()
    } catch { toast.error("Failed to save") }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("Delete this item?")) return
    try {
      const res = await fetch(`/api/admin/content/${type === "block" ? "" : type + "/"}${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Deleted")
      fetchData()
    } catch { toast.error("Failed to delete") }
  }

  const resetForms = () => {
    setShowForm(false)
    setEditing(null)
    setBlockForm({ key: "", type: "TEXT", content: "", isActive: true })
    setBannerForm({ title: "", image: "", link: "", position: "HOME_TOP", sortOrder: 0, isActive: true })
    setPageForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isActive: true })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="font-playfair text-xl font-bold">Content Management</h2>
        <div className="animate-pulse bg-white border border-cavree-border rounded-lg h-64" />
      </div>
    )
  }

  const tabs = [
    { key: "blocks" as const, label: `Content Blocks (${blocks.length})` },
    { key: "banners" as const, label: `Banners (${banners.length})` },
    { key: "pages" as const, label: `Pages (${pages.length})` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-xl font-bold">Content Management</h2>
        <button onClick={() => { resetForms(); setShowForm(!showForm) }} className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light">
          {showForm ? "Cancel" : `Add ${tab === "blocks" ? "Content" : tab === "banners" ? "Banner" : "Page"}`}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cavree-border">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); resetForms() }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-cavree-primary text-cavree-primary" : "border-transparent text-cavree-muted hover:text-cavree-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Forms */}
      {showForm && tab === "blocks" && (
        <form onSubmit={handleBlockSubmit} className="bg-white border border-cavree-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <input placeholder="Key" value={blockForm.key} onChange={(e) => setBlockForm({ ...blockForm, key: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
            <select value={blockForm.type} onChange={(e) => setBlockForm({ ...blockForm, type: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary">
              <option value="TEXT">Text</option>
              <option value="HTML">HTML</option>
              <option value="IMAGE">Image</option>
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={blockForm.isActive} onChange={(e) => setBlockForm({ ...blockForm, isActive: e.target.checked })} /> Active</label>
          </div>
          <textarea placeholder="Content" value={blockForm.content} onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })} rows={4} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary resize-none" />
          <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium">{editing ? "Update" : "Create"}</button>
        </form>
      )}

      {showForm && tab === "banners" && (
        <form onSubmit={handleBannerSubmit} className="bg-white border border-cavree-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input placeholder="Title" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
            <input placeholder="Image URL" value={bannerForm.image} onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
            <input placeholder="Link" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
            <input type="number" placeholder="Sort Order" value={bannerForm.sortOrder} onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: parseInt(e.target.value) || 0 })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          </div>
          <div className="flex gap-4">
            <select value={bannerForm.position} onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })} className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary">
              <option value="HOME_TOP">Home Top</option>
              <option value="HOME_MIDDLE">Home Middle</option>
              <option value="CATEGORY">Category Page</option>
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bannerForm.isActive} onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })} /> Active</label>
          </div>
          <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium">{editing ? "Update" : "Create"}</button>
        </form>
      )}

      {showForm && tab === "pages" && (
        <form onSubmit={handlePageSubmit} className="bg-white border border-cavree-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Title" value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
            <input placeholder="Slug" value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} required className="border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          </div>
          <input placeholder="Meta Title" value={pageForm.metaTitle} onChange={(e) => setPageForm({ ...pageForm, metaTitle: e.target.value })} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <input placeholder="Meta Description" value={pageForm.metaDescription} onChange={(e) => setPageForm({ ...pageForm, metaDescription: e.target.value })} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary" />
          <textarea placeholder="Content" value={pageForm.content} onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })} rows={6} className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary resize-none" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pageForm.isActive} onChange={(e) => setPageForm({ ...pageForm, isActive: e.target.checked })} /> Active</label>
          <button type="submit" className="bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium">{editing ? "Update" : "Create"}</button>
        </form>
      )}

      {/* Tables */}
      {tab === "blocks" && (
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
                    <button onClick={() => { setEditing(b.id); setBlockForm({ key: b.key, type: b.type, content: b.content || "", isActive: b.isActive }); setShowForm(true); setTab("blocks") }} className="text-sm text-cavree-primary hover:underline">Edit</button>
                    <button onClick={() => handleDelete("block", b.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "banners" && (
        <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Title</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Position</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Status</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-cavree-border">
              {banners.map((b: any) => (
                <tr key={b.id} className="hover:bg-cavree-light/50">
                  <td className="px-6 py-4 text-sm font-medium">{b.title}</td>
                  <td className="px-6 py-4 text-sm font-poppins">{b.position}</td>
                  <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${b.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{b.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setEditing(b.id); setBannerForm({ title: b.title, image: b.image, link: b.link || "", position: b.position, sortOrder: b.sortOrder, isActive: b.isActive }); setShowForm(true); setTab("banners") }} className="text-sm text-cavree-primary hover:underline">Edit</button>
                    <button onClick={() => handleDelete("banners", b.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "pages" && (
        <div className="bg-white border border-cavree-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-cavree-light"><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Title</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Slug</th><th className="text-left px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Status</th><th className="text-right px-6 py-3 text-xs font-semibold text-cavree-muted uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-cavree-border">
              {pages.map((p: any) => (
                <tr key={p.id} className="hover:bg-cavree-light/50">
                  <td className="px-6 py-4 text-sm font-medium">{p.title}</td>
                  <td className="px-6 py-4 text-sm font-poppins">/{p.slug}</td>
                  <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${p.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{p.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setEditing(p.id); setPageForm({ title: p.title, slug: p.slug, content: p.content || "", metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "", isActive: p.isActive }); setShowForm(true); setTab("pages") }} className="text-sm text-cavree-primary hover:underline">Edit</button>
                    <button onClick={() => handleDelete("pages", p.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
