import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, orderStatusUpdateSchema } from "@/lib/validators"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } },
        address: true,
        payment: true,
        shippingDetail: true,
        franchise: { select: { name: true } },
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(orderStatusUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: validation.data.status },
    })
    await logActivity({
      userId: user.userId as string,
      action: "UPDATE_SUPER_ADMIN_ORDER_STATUS",
      entity: "Order",
      entityId: order.id,
      details: { orderNumber: order.orderNumber, status: order.status },
    })
    return NextResponse.json({ order })
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
    const order = await prisma.order.findUnique({ where: { id: params.id }, select: { orderNumber: true } })
    await prisma.order.delete({ where: { id: params.id } })
    await logActivity({
      userId: user.userId as string,
      action: "DELETE_SUPER_ADMIN_ORDER",
      entity: "Order",
      entityId: params.id,
      details: { orderNumber: order?.orderNumber || "" },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
