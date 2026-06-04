import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, verifyPassword } from "@/lib/auth"
import { validate, bulkCheckoutSchema } from "@/lib/validators"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

function generateBulkOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BULK-${stamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const scope = await getAdminScope(session)
    const body = await request.json()
    const validation = validate(bulkCheckoutSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    if (!user?.password || !(await verifyPassword(validation.data.password, user.password))) {
      return NextResponse.json({ error: "Invalid franchise verification password" }, { status: 401 })
    }

    const [retailer, franchise, cart] = await Promise.all([
      prisma.retailer.findUnique({ where: { franchiseCode: validation.data.franchiseCode } }),
      prisma.franchise.findFirst({
        where: {
          OR: [
            { slug: validation.data.franchiseCode },
            { ownerId: session.userId as string },
          ],
        },
      }),
      prisma.bulkCart.findUnique({
        where: { userId: session.userId as string },
        include: { items: { include: { product: true } } },
      }),
    ])

    const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN"
    const ownsRetailer = retailer?.userId === session.userId
    const ownsFranchise = franchise?.ownerId === session.userId
    const isStaffForFranchise = scope.franchiseId && franchise?.id === scope.franchiseId
    if (!isAdmin && !ownsRetailer && !ownsFranchise && !isStaffForFranchise) {
      return NextResponse.json({ error: "Franchise code does not match this account" }, { status: 403 })
    }
    if (!cart?.items.length) {
      return NextResponse.json({ error: "Bulk cart is empty" }, { status: 400 })
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.total, 0)
    const tax = Math.round(subtotal * 0.18)
    const total = subtotal + tax
    const totalUnits = cart.items.reduce((sum, item) => sum + item.unitCount, 0)
    const totalPieces = cart.items.reduce((sum, item) => sum + item.unitCount * item.unitSize, 0)

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.bulkOrder.create({
        data: {
          orderNumber: generateBulkOrderNumber(),
          franchiseCode: validation.data.franchiseCode,
          paymentMethod: validation.data.paymentMethod,
          paymentStatus: validation.data.paymentMethod === "COD" ? "PENDING" : "PENDING",
          subtotal,
          tax,
          total,
          totalUnits,
          totalPieces,
          deliveryName: validation.data.deliveryName || retailer?.ownerName || franchise?.name || user.name,
          deliveryPhone: validation.data.deliveryPhone || retailer?.phone || franchise?.phone || user.phone,
          deliveryAddress: validation.data.deliveryAddress || retailer?.address || franchise?.address,
          deliveryCity: validation.data.deliveryCity || retailer?.city || franchise?.city,
          deliveryState: validation.data.deliveryState || retailer?.state || franchise?.state,
          notes: validation.data.notes,
          userId: user.id,
          retailerId: retailer?.id,
          items: {
            create: cart.items.map((item) => ({
              name: item.product.name,
              productCode: item.product.productId,
              unitCount: item.unitCount,
              unitSize: item.unitSize,
              unitPrice: item.unitPrice,
              selectedUnitCodes: item.selectedUnitCodes,
              total: item.total,
              productId: item.productId,
            })),
          },
          timeline: {
            create: {
              status: "PENDING",
              title: "Bulk order placed",
              note: "The order is waiting for admin confirmation.",
            },
          },
        },
        include: { items: true, timeline: true },
      })

      for (const item of cart.items) {
        await tx.bulkProduct.update({
          where: { id: item.productId },
          data: { availableUnits: { decrement: item.unitCount } },
        })
        if (item.selectedUnitCodes.length) {
          await tx.bulkProductUnit.updateMany({
            where: { unitCode: { in: item.selectedUnitCodes } },
            data: { status: "RESERVED" },
          })
        }
      }

      await tx.bulkCartItem.deleteMany({ where: { cartId: cart.id } })
      return created
    })

    await logActivity({
      userId: user.id,
      action: "CREATE_BULK_ORDER",
      entity: "BulkOrder",
      entityId: order.id,
      details: { orderNumber: order.orderNumber, total },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Bulk checkout error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
