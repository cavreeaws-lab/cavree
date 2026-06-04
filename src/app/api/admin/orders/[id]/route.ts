import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, orderStatusUpdateSchema } from "@/lib/validators"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
  CANCELLED: [],
}

function isValidTransition(current: string, next: string): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false
}

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

    const newStatus = validation.data.status
    if (!isValidTransition(existing.status, newStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${existing.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    const orderWithPayment = await prisma.order.findFirst({
      where: { id: params.id },
      include: { payment: true, franchise: { select: { id: true, commission: true } }, items: true },
    })

    if (!orderWithPayment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const payment = orderWithPayment.payment
    if ((status === "SHIPPED" || status === "DELIVERED") && payment?.method === "RAZORPAY" && payment?.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot ship/deliver Razorpay order before payment is verified" },
        { status: 400 }
      )
    }

    const order = await prisma.$transaction(async (tx: any) => {
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

      if (status === "DELIVERED" && orderWithPayment.franchise) {
        const commissionRate = (orderWithPayment.franchise.commission || 10) / 100
        const commissionAmount = orderWithPayment.subtotal * commissionRate
        const existingCredit = await tx.commissionCredit.findFirst({
          where: { source: `order-${orderWithPayment.id}`, franchiseId: orderWithPayment.franchise.id },
        })
        if (!existingCredit && commissionAmount > 0) {
          await tx.commissionCredit.create({
            data: {
              amount: commissionAmount,
              rate: commissionRate * 100,
              source: `order-${orderWithPayment.id}`,
              status: "PENDING" as any,
              franchiseId: orderWithPayment.franchise.id,
              userId: orderWithPayment.userId,
            },
          })
        }
      }

      if (status === "CONFIRMED") {
        const existingInvoice = await tx.invoice.findFirst({ where: { orderId: params.id } })
        if (!existingInvoice) {
          await tx.invoice.create({
            data: {
              orderId: params.id,
              invoiceNumber: `INV-${orderWithPayment.orderNumber}`,
            },
          })
        }
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
