import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "newest"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    const franchise = await prisma.franchise.findUnique({
      where: { slug: params.slug, isActive: true, isApproved: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        banner: true,
        address: true,
        city: true,
        state: true,
        phone: true,
        email: true,
        commission: true,
        createdAt: true,
      },
    })

    if (!franchise) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 })
    }

    const where: any = {
      isActive: true,
      franchiseId: franchise.id,
    }

    if (category && category !== "ALL") {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

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
      images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
      media: { orderBy: { sortOrder: "asc" as const } },
      variants: true,
      _count: { select: { reviews: true } },
      productStocks: {
        where: { franchiseId: franchise.id },
        select: { quantity: true, lowStockThreshold: true },
      },
    }

    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: {
          products: { some: { franchiseId: franchise.id, isActive: true } },
        },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ])

    const normalizedProducts = (products as any[]).map((product: any) => ({
      ...product,
      images:
        product.images?.length > 0
          ? product.images
          : (product.media || [])
              .filter((item: any) => item.type === "IMAGE")
              .slice(0, 1),
    }))

    return NextResponse.json({
      franchise,
      products: normalizedProducts,
      categories,
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
    console.error("Franchise public store error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
