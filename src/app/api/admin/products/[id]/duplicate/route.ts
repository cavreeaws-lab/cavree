import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const where: any = { id: params.id }
    if (scope.franchiseId) where.franchiseId = scope.franchiseId

    const source = await prisma.product.findFirst({
      where,
      include: { images: true, variants: true },
    })
    if (!source) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const suffix = Date.now().toString(36)
    const product = await prisma.product.create({
      data: {
        name: `${source.name} Copy`,
        slug: `${source.slug}-copy-${suffix}`,
        description: source.description,
        brand: source.brand,
        barcode: source.barcode ? `${source.barcode}-${suffix}` : null,
        sku: `${source.sku}-COPY-${suffix.toUpperCase()}`,
        price: source.price,
        comparePrice: source.comparePrice,
        costPrice: source.costPrice,
        quantity: source.quantity,
        weight: source.weight,
        dimensions: source.dimensions || undefined,
        trackQuantity: source.trackQuantity,
        allowBackorders: source.allowBackorders,
        lowStockThreshold: source.lowStockThreshold,
        isActive: false,
        isFeatured: false,
        isNew: source.isNew,
        tags: source.tags,
        metaTitle: source.metaTitle,
        metaDescription: source.metaDescription,
        categoryId: source.categoryId,
        franchiseId: source.franchiseId,
        images: {
          create: source.images.map((image) => ({
            url: image.url,
            alt: image.alt,
            sortOrder: image.sortOrder,
          })),
        },
        variants: {
          create: source.variants.map((variant, i) => ({
            size: variant.size,
            color: variant.color,
            colorCode: variant.colorCode,
            sku: `${variant.sku}-COPY-${suffix.toUpperCase()}-${i + 1}`,
            price: variant.price,
            quantity: variant.quantity,
          })),
        },
      },
      include: { images: true, variants: true, category: { select: { name: true } } },
    })

    await logActivity({
      userId: scope.userId,
      action: "DUPLICATE",
      entity: "Product",
      entityId: product.id,
      details: { sourceId: source.id, name: product.name },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Product duplicate error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
