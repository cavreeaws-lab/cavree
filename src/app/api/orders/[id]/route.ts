import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const order = await prisma.order.findFirst({
      where: {
        userId: session.userId as string,
        OR: [
          { id: params.id },
          { orderNumber: params.id },
        ],
      },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        address: true,
        payment: true,
        shippingDetail: true,
        franchise: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Order detail error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
