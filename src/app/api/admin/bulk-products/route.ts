import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { logActivity } from "@/lib/admin"
import { bulkProductSchema, validate } from "@/lib/validators"

export const dynamic = "force-dynamic"

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { productId: { contains: search, mode: "insensitive" } },
      ]
    }
    const products = await prisma.bulkProduct.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { units: true },
    })
    return NextResponse.json({ products })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(bulkProductSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const availableUnits = data.availableUnits ?? 0
    const specs = {
      ...(data.specs && typeof data.specs === "object" ? data.specs : {}),
      productType: data.productType || (data.specs as any)?.productType,
      shirtType: data.shirtType || (data.specs as any)?.shirtType,
      modelNumber: data.modelNumber || (data.specs as any)?.modelNumber,
    }
    const product = await prisma.bulkProduct.upsert({
      where: { productId: data.productId },
      create: {
        productId: data.productId,
        name: data.name,
        slug: data.slug || slugify(`${data.name}-${data.productId}`),
        description: data.description || null,
        category: data.category,
        image: data.image || null,
        media: data.media as any,
        singlePiecePrice: data.singlePiecePrice || 0,
        wholesalePrice: data.wholesalePrice,
        unitSize: data.unitSize || 1000,
        minUnits: data.minUnits || 1,
        availableUnits,
        specs: specs as any,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        units: {
          create: Array.from({ length: availableUnits }, (_, index) => ({
            unitCode: `${data.productId}-UNIT-${String(index + 1).padStart(3, "0")}`,
          })),
        },
      },
      update: {
        name: data.name,
        slug: data.slug || slugify(`${data.name}-${data.productId}`),
        description: data.description || null,
        category: data.category,
        image: data.image || null,
        media: data.media as any,
        singlePiecePrice: data.singlePiecePrice || 0,
        wholesalePrice: data.wholesalePrice,
        unitSize: data.unitSize || 1000,
        minUnits: data.minUnits || 1,
        availableUnits,
        specs: specs as any,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
      },
      include: { units: true },
    })
    await logActivity({
      userId: session.userId as string,
      action: "UPSERT",
      entity: "BulkProduct",
      entityId: product.id,
      details: { productId: product.productId, availableUnits },
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Bulk product upsert error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
