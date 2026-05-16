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
        address: true,
        payment: true,
        shippingDetail: true,
        user: { select: { name: true, email: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
