import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get("orderNumber")
    if (!orderNumber) {
      return NextResponse.json({ error: "Order number required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.toUpperCase() },
      include: {
        items: { include: { product: { select: { name: true, images: { take: 1 } } } } },
        shippingDetail: true,
        payment: { select: { method: true, status: true } },
        address: { select: { city: true, state: true, pincode: true, country: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const session = await requireAuth().catch(() => null)
    if (session && session.userId !== order.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = order.user
    delete (order as any).user

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        total: order.total,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: item.product,
        })),
        address: order.address,
        payment: order.payment,
        shippingDetail: order.shippingDetail,
      },
      customer: session ? { name: user?.name, email: user?.email, phone: user?.phone } : undefined,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
