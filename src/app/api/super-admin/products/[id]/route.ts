import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, productUpdateSchema } from "@/lib/validators"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(productUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        modelNumber: data.modelNumber,
        sku: data.sku,
        price: data.price,
        comparePrice: data.compareAtPrice || null,
        quantity: data.quantity,
        categoryId: data.categoryId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
      include: {
        images: true,
        media: true,
        variants: true,
        category: { select: { name: true } },
      },
    })
    await logActivity({
      userId: user.userId as string,
      action: "UPDATE_SUPER_ADMIN_PRODUCT",
      entity: "Product",
      entityId: product.id,
      details: { name: product.name, isActive: product.isActive },
    })
    return NextResponse.json({ product })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["SUPER_ADMIN"])
    const product = await prisma.product.findUnique({ where: { id: params.id }, select: { name: true } })
    await prisma.product.delete({ where: { id: params.id } })
    await logActivity({
      userId: user.userId as string,
      action: "DELETE_SUPER_ADMIN_PRODUCT",
      entity: "Product",
      entityId: params.id,
      details: { name: product?.name || "" },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
