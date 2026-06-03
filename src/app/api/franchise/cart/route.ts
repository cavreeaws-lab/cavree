import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, bulkCartItemSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

async function getCart(userId: string) {
  const cart = await prisma.bulkCart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: { product: true },
      },
    },
  })
  const subtotal = cart?.items.reduce((sum, item) => sum + item.total, 0) || 0
  const totalUnits = cart?.items.reduce((sum, item) => sum + item.unitCount, 0) || 0
  const totalPieces = cart?.items.reduce((sum, item) => sum + item.unitCount * item.unitSize, 0) || 0
  const tax = Math.round(subtotal * 0.18)
  return { cart, summary: { subtotal, tax, total: subtotal + tax, totalUnits, totalPieces } }
}

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    return NextResponse.json(await getCart(session.userId as string))
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const body = await request.json()
    const validation = validate(bulkCartItemSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }

    const product = await prisma.bulkProduct.findUnique({
      where: { id: validation.data.productId },
      include: { units: { where: { status: "AVAILABLE" }, orderBy: { unitCode: "asc" } } },
    })
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not available" }, { status: 404 })
    }
    if (validation.data.unitCount < product.minUnits) {
      return NextResponse.json({ error: `Minimum ${product.minUnits} unit(s) required` }, { status: 400 })
    }
    if (validation.data.unitCount > product.availableUnits) {
      return NextResponse.json({ error: "Requested units exceed available stock" }, { status: 400 })
    }

    const cart = await prisma.bulkCart.upsert({
      where: { userId: session.userId as string },
      create: { userId: session.userId as string },
      update: {},
    })
    const selectedUnitCodes =
      product.units.length >= validation.data.unitCount
        ? product.units.slice(0, validation.data.unitCount).map((unit) => unit.unitCode)
        : Array.from({ length: validation.data.unitCount }, (_, index) => `${product.productId}-UNIT-${index + 1}`)
    const total = product.wholesalePrice * validation.data.unitCount

    await prisma.bulkCartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      create: {
        cartId: cart.id,
        productId: product.id,
        unitCount: validation.data.unitCount,
        unitSize: product.unitSize,
        unitPrice: product.wholesalePrice,
        selectedUnitCodes,
        total,
      },
      update: {
        unitCount: validation.data.unitCount,
        unitSize: product.unitSize,
        unitPrice: product.wholesalePrice,
        selectedUnitCodes,
        total,
      },
    })

    return NextResponse.json(await getCart(session.userId as string))
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Bulk cart error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const cart = await prisma.bulkCart.findUnique({ where: { userId: session.userId as string } })
    if (!cart) return NextResponse.json(await getCart(session.userId as string))

    if (itemId) {
      await prisma.bulkCartItem.deleteMany({ where: { id: itemId, cartId: cart.id } })
    } else {
      await prisma.bulkCartItem.deleteMany({ where: { cartId: cart.id } })
    }
    return NextResponse.json(await getCart(session.userId as string))
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
