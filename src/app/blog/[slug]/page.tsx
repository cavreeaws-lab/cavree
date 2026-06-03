import { notFound } from "next/navigation"
import { buildMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "https://cavree.com"}/api/blog/posts/${params.slug}`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) return buildMetadata({ title: "Not Found - Cavree" })
  const { post } = await res.json()
  return buildMetadata({
    title: `${post.title} - Cavree Blog`,
    description: post.excerpt || post.metaDescription,
    image: post.coverImage,
    url: `/blog/${post.slug}`,
    type: "article",
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt,
  })
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "https://cavree.com"}/api/blog/posts/${params.slug}`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) notFound()
  const { post } = await res.json()

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {post.coverImage && (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        {post.category && <span className="bg-gray-100 px-3 py-1 rounded-full">{post.category.name}</span>}
        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
      </div>
      <article
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />
    </main>
  )
}
