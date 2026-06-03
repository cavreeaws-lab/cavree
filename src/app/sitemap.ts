import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cavree.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages, posts] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.page.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ])

  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.7 },
  ]

  products.forEach((p) =>
    routes.push({ url: `${baseUrl}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })
  )

  categories.forEach((c) =>
    routes.push({ url: `${baseUrl}/shop?category=${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })
  )

  pages.forEach((p) =>
    routes.push({ url: `${baseUrl}/page/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })
  )

  posts.forEach((p) =>
    routes.push({ url: `${baseUrl}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })
  )

  return routes
}
