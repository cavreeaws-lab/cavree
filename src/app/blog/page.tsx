import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Blog - Cavree",
  description: "Latest fashion trends, style guides, and editorial content from Cavree.",
  url: "/blog",
})

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://cavree.com"}/api/blog/posts`, {
    next: { revalidate: 60 },
  })
  const data = await res.json()
  const posts = data.posts || []

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Editorial</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <a key={post.id} href={`/blog/${post.slug}`} className="group block">
            {post.coverImage && (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            )}
            <h2 className="text-lg font-semibold group-hover:underline">{post.title}</h2>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.excerpt}</p>
            <span className="text-xs text-gray-400 mt-3 block">
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
            </span>
          </a>
        ))}
      </div>
    </main>
  )
}
