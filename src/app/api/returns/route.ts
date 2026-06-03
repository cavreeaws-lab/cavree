import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { returnRequestSchema, validate } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth()
    const returns = await prisma.returnRequest.findMany({
      where: { userId: session.userId as string },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ returns })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const validation = validate(returnRequestSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: validation.data.orderId,
        userId: session.userId as string,
        status: { in: ["DELIVERED", "SHIPPED"] },
      },
      include: { items: true },
    })
    if (!order) {
      return NextResponse.json({ error: "Order is not eligible for return or exchange" }, { status: 400 })
    }
    if (validation.data.productId && !order.items.some((item) => item.productId === validation.data.productId)) {
      return NextResponse.json({ error: "Product is not part of this order" }, { status: 400 })
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        productId: validation.data.productId,
        userId: session.userId as string,
        type: validation.data.type,
        reason: validation.data.reason,
      },
    })

    return NextResponse.json({ returnRequest }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
