import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, productUpdateSchema } from "@/lib/validators"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const where: any = { id: params.id }
    if (scope.franchiseId) where.franchiseId = scope.franchiseId

    const product = await prisma.product.findFirst({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        media: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: { select: { id: true, name: true } },
        franchise: { select: { id: true, name: true, city: true } },
      },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)

    const existing = await prisma.product.findFirst({
      where: { id: params.id, franchiseId: scope.franchiseId || undefined },
    })
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const body = await request.json()
    const validation = validate(productUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const product = await prisma.$transaction(async (tx) => {
      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: params.id } })
      }
      if (data.media) {
        await tx.productMedia.deleteMany({ where: { productId: params.id } })
        await tx.productImage.deleteMany({ where: { productId: params.id } })
      }
      if (data.variants) {
        await tx.productVariant.deleteMany({ where: { productId: params.id } })
      }

      return tx.product.update({
        where: { id: params.id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          modelNumber: data.modelNumber,
          productType: data.productType,
          shirtType: data.shirtType,
          brand: data.brand,
          barcode: data.barcode,
          sku: data.sku,
          price: data.price,
          comparePrice: data.compareAtPrice ?? undefined,
          costPrice: data.costPrice ?? undefined,
          singlePiecePrice: data.singlePiecePrice ?? undefined,
          franchiseBulkPrice: data.franchiseBulkPrice ?? undefined,
          minimumQuantityLimit: data.minimumQuantityLimit ?? undefined,
          quantity: data.quantity,
          weight: data.weight ?? undefined,
          dimensions: data.dimensions ?? undefined,
          trackQuantity: data.trackQuantity,
          allowBackorders: data.allowBackorders,
          lowStockThreshold: data.lowStockThreshold,
          categoryId: data.categoryId,
          franchiseId: data.franchiseId,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          tags: data.tags,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          images: data.images
            ? { create: data.images.map((img, i) => ({ url: img.url, alt: img.alt || null, sortOrder: i })) }
            : data.media
              ? { create: data.media.filter((item) => item.type === "IMAGE").map((item, i) => ({ url: item.url, alt: item.alt || null, sortOrder: i })) }
              : undefined,
          media: data.media
            ? { create: data.media.map((item, i) => ({ type: item.type, url: item.url, posterUrl: item.posterUrl || null, alt: item.alt || null, sortOrder: i })) }
            : data.images
              ? { create: data.images.map((img, i) => ({ type: "IMAGE", url: img.url, alt: img.alt || null, sortOrder: i })) }
            : undefined,
          variants: data.variants
            ? {
                create: data.variants.map((variant, i) => ({
                  size: variant.size || variant.name || null,
                  color: variant.color || variant.value || null,
                  colorCode: variant.colorCode || null,
                  sku: variant.sku || `${data.sku || existing.sku}-V${i + 1}`,
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
    })

    await logActivity({
      userId: scope.userId,
      action: "UPDATE",
      entity: "Product",
      entityId: product.id,
      details: { name: product.name, sku: product.sku },
    })

    return NextResponse.json({ product })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)

    const existing = await prisma.product.findFirst({
      where: { id: params.id, franchiseId: scope.franchiseId || undefined },
    })
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.product.delete({ where: { id: params.id } })
    await logActivity({
      userId: scope.userId,
      action: "DELETE",
      entity: "Product",
      entityId: params.id,
      details: { name: existing.name, sku: existing.sku },
    })
    return NextResponse.json({ message: "Product deleted" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
