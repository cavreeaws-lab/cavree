import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const categorySlug = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = { isPublished: true }
    if (categorySlug) {
      const category = await prisma.blogCategory.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      })
      if (category) where.categoryId = category.id
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { name: true, slug: true } } },
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({ posts, total, page, limit })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
