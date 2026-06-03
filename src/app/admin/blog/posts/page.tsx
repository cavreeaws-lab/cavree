"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function AdminBlogPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    categoryId: "",
    isPublished: false,
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/blog/posts").then((r) => r.json()),
      fetch("/api/blog/categories").then((r) => r.json()),
    ])
      .then(([postsData, catsData]) => {
        setPosts(postsData.posts || [])
        setCategories(catsData.categories || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load blog data")
        setLoading(false)
      })
  }, [])

  async function createPost(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/blog/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success("Post created")
      setShowForm(false)
      setForm({ title: "", slug: "", excerpt: "", content: "", categoryId: "", isPublished: false })
      const refreshed = await fetch("/api/admin/blog/posts").then((r) => r.json())
      setPosts(refreshed.posts || [])
    } else {
      toast.error("Failed to create post")
    }
  }

  async function togglePublish(post: any) {
    const res = await fetch(`/api/admin/blog/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !post.isPublished }),
    })
    if (res.ok) {
      toast.success("Post updated")
      const refreshed = await fetch("/api/admin/blog/posts").then((r) => r.json())
      setPosts(refreshed.posts || [])
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return
    const res = await fetch(`/api/admin/blog/posts/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Post deleted")
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-black text-white px-4 py-2 rounded-md text-sm">
          {showForm ? "Cancel" : "New Post"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createPost} className="border rounded-lg p-4 mb-6 space-y-3">
          <input placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
          <input placeholder="Slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
          <textarea placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" rows={2} />
          <textarea placeholder="Content (HTML/Markdown)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" rows={6} />
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Publish immediately
          </label>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm">Create Post</button>
        </form>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t">
                <td className="px-4 py-2">
                  <Link href={`/blog/${post.slug}`} target="_blank" className="font-medium hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-2">{post.category?.name || "—"}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${post.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => togglePublish(post)} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {post.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => deletePost(post.id)} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
