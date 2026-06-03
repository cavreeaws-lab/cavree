import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const franchise = searchParams.get("franchise")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const size = searchParams.get("size")
    const color = searchParams.get("color")
    const availability = searchParams.get("availability")
    const minRating = searchParams.get("minRating")
    const isFeatured = searchParams.get("isFeatured")
    const isNew = searchParams.get("isNew")
    const sort = searchParams.get("sort") || "newest"
    const seed = searchParams.get("seed") || `${Date.now()}`
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    const where: any = { isActive: true }

    if (category) {
      where.category = { slug: category }
    }

    if (franchise) {
      where.franchise = { slug: franchise }
    }

    if (isFeatured === "true") where.isFeatured = true
    if (isNew === "true") where.isNew = true

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    if (availability === "in-stock") where.quantity = { gt: 0 }
    if (availability === "low-stock") where.quantity = { gt: 0, lte: 5 }
    if (availability === "out-of-stock") where.quantity = { lte: 0 }
    if (size) where.variants = { some: { size } }
    if (color) where.variants = { some: { ...(where.variants?.some || {}), color: { contains: color, mode: "insensitive" } } }
    if (minRating) where.reviews = { some: { rating: { gte: Number(minRating) } } }

    const orderBy: any = {}
    switch (sort) {
      case "price-low":
        orderBy.price = "asc"
        break
      case "price-high":
        orderBy.price = "desc"
        break
      case "name":
        orderBy.name = "asc"
        break
      default:
        orderBy.createdAt = "desc"
    }

    const include = {
      category: { select: { id: true, name: true, slug: true } },
      franchise: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
      media: { orderBy: { sortOrder: "asc" as const } },
      variants: true,
      _count: { select: { reviews: true } },
    }

    const seededScore = (value: string) => {
      let hash = 2166136261
      for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
      }
      return hash >>> 0
    }
    const seedHash = seededScore(seed)
    const seededProductScore = (id: string) => {
      let score = seededScore(id) ^ seedHash
      score ^= score << 13
      score ^= score >>> 17
      score ^= score << 5
      return score >>> 0
    }

    let products: any[]
    let total: number

    if (sort === "random") {
      const allProducts = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include,
      })
      total = allProducts.length
      products = allProducts
        .sort((a, b) => seededProductScore(a.id) - seededProductScore(b.id))
        .slice((page - 1) * limit, page * limit)
    } else {
      ;[products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include,
        }),
        prisma.product.count({ where }),
      ])
    }

    const normalizedProducts = products.map((product) => ({
      ...product,
      images: product.images.length > 0 ? product.images : product.media.filter((item: any) => item.type === "IMAGE").slice(0, 1),
    }))

    return NextResponse.json({
      products: normalizedProducts,
      total,
      page,
      limit,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
