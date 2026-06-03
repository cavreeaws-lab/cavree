import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

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
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
