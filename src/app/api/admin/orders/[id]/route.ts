import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, orderStatusUpdateSchema } from "@/lib/validators"
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

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } },
        address: true,
        payment: true,
        shippingDetail: true,
        franchise: { select: { name: true } },
        invoices: true,
        returns: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
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

    const where: any = { id: params.id }
    if (scope.franchiseId) where.franchiseId = scope.franchiseId
    const existing = await prisma.order.findFirst({ where })
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const body = await request.json()
    const validation = validate(orderStatusUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const order = await prisma.$transaction(async (tx) => {
      const status = validation.data.status
      const shippingStatus =
        status === "SHIPPED" ? "SHIPPED" :
        status === "DELIVERED" ? "DELIVERED" :
        status === "PROCESSING" || status === "CONFIRMED" ? "PROCESSING" :
        undefined

      if (
        validation.data.trackingNumber ||
        validation.data.carrier ||
        validation.data.trackingUrl ||
        validation.data.estimatedDate ||
        shippingStatus
      ) {
        await tx.shipping.upsert({
          where: { orderId: params.id },
          update: {
            carrier: validation.data.carrier,
            trackingNumber: validation.data.trackingNumber,
            trackingUrl: validation.data.trackingUrl,
            estimatedDate: validation.data.estimatedDate ? new Date(validation.data.estimatedDate) : undefined,
            status: shippingStatus as any,
            shippedAt: status === "SHIPPED" ? new Date() : undefined,
            deliveredAt: status === "DELIVERED" ? new Date() : undefined,
          },
          create: {
            orderId: params.id,
            carrier: validation.data.carrier,
            trackingNumber: validation.data.trackingNumber,
            trackingUrl: validation.data.trackingUrl,
            estimatedDate: validation.data.estimatedDate ? new Date(validation.data.estimatedDate) : undefined,
            status: (shippingStatus || "PENDING") as any,
            shippedAt: status === "SHIPPED" ? new Date() : undefined,
            deliveredAt: status === "DELIVERED" ? new Date() : undefined,
          },
        })
      }

      return tx.order.update({
        where: { id: params.id },
        data: { status },
        include: {
          items: true,
          user: { select: { name: true, email: true } },
          payment: true,
          shippingDetail: true,
        },
      })
    })

    await logActivity({
      userId: scope.userId,
      action: "UPDATE_STATUS",
      entity: "Order",
      entityId: order.id,
      details: { status: order.status, notes: validation.data.notes },
    })

    return NextResponse.json({ order })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
