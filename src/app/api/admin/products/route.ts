import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, productSchema } from "@/lib/validators"
import { csvResponse, getAdminScope, logActivity, toCsv } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")
    const isActive = searchParams.get("isActive")
    const categoryId = searchParams.get("categoryId")
    const stockStatus = searchParams.get("stockStatus")
    const exportType = searchParams.get("export")

    const where: any = scope.franchiseId ? { franchiseId: scope.franchiseId } : {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { modelNumber: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ]
    }
    if (isActive === "true") where.isActive = true
    if (isActive === "false") where.isActive = false
    if (categoryId) where.categoryId = categoryId
    if (stockStatus === "low") where.quantity = { lte: 5, gt: 0 }
    if (stockStatus === "out") where.quantity = 0
    if (stockStatus === "in") where.quantity = { gt: 0 }

    if (exportType === "csv") {
      const rows = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true } }, franchise: { select: { name: true } } },
      })
      return csvResponse(
        "products.csv",
        toCsv(
          rows.map((product: any) => ({
            name: product.name,
            sku: product.sku,
            brand: product.brand || "",
            category: product.category?.name || "",
            franchise: product.franchise?.name || "",
            price: product.price,
            quantity: product.quantity,
            status: product.isActive ? "Active" : "Inactive",
          })),
          [
            { key: "name", label: "Name" },
            { key: "sku", label: "SKU" },
            { key: "brand", label: "Brand" },
            { key: "category", label: "Category" },
            { key: "franchise", label: "Franchise" },
            { key: "price", label: "Price" },
            { key: "quantity", label: "Stock" },
            { key: "status", label: "Status" },
          ]
        )
      )
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true } },
          franchise: { select: { name: true } },
          images: { take: 1 },
          media: { orderBy: { sortOrder: "asc" } },
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    let franchiseId = scope.franchiseId
    if (scope.isFranchiseScoped && !franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const body = await request.json()
    const validation = validate(productSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    if (!franchiseId) {
      franchiseId = data.franchiseId
    }
    if (!franchiseId) {
      return NextResponse.json({ error: "Franchise ID is required" }, { status: 400 })
    }
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        description: data.description,
        modelNumber: data.modelNumber || null,
        productType: data.productType || null,
        shirtType: data.shirtType || null,
        brand: data.brand || null,
        barcode: data.barcode || null,
        sku: data.sku,
        price: data.price,
        comparePrice: data.compareAtPrice || null,
        costPrice: data.costPrice || null,
        singlePiecePrice: data.singlePiecePrice || null,
        franchiseBulkPrice: data.franchiseBulkPrice || null,
        minimumQuantityLimit: data.minimumQuantityLimit || null,
        quantity: data.quantity || 0,
        weight: data.weight || null,
        dimensions: data.dimensions || undefined,
        trackQuantity: data.trackQuantity ?? true,
        allowBackorders: data.allowBackorders ?? false,
        lowStockThreshold: data.lowStockThreshold ?? 5,
        categoryId: data.categoryId,
        franchiseId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? false,
        tags: data.tags || [],
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        images: (data.images?.length || data.media?.some((item) => item.type === "IMAGE"))
          ? { create: (data.images?.length ? data.images : (data.media || []).filter((item) => item.type === "IMAGE")).map((img, i) => ({ url: img.url, alt: img.alt || null, sortOrder: i })) }
          : undefined,
        media: data.media?.length
          ? { create: data.media.map((item, i) => ({ type: item.type, url: item.url, posterUrl: item.posterUrl || null, alt: item.alt || null, sortOrder: i })) }
          : data.images?.length
            ? { create: data.images.map((img, i) => ({ type: "IMAGE", url: img.url, alt: img.alt || null, sortOrder: i })) }
          : undefined,
        variants: data.variants?.length
          ? {
              create: data.variants.map((variant, i) => ({
                size: variant.size || variant.name || null,
                color: variant.color || variant.value || null,
                colorCode: variant.colorCode || null,
                sku: variant.sku || `${data.sku}-V${i + 1}`,
                price: variant.price || null,
                quantity: variant.quantity || 0,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        media: true,
        variants: true,
        category: { select: { name: true } },
      },
    })

    await logActivity({
      userId: scope.userId,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      details: { name: product.name, sku: product.sku },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
