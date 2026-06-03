import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get("orderNumber")
    if (!orderNumber) return NextResponse.json({ error: "Order number is required" }, { status: 400 })

    const order = await prisma.bulkOrder.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        total: true,
        totalUnits: true,
        totalPieces: true,
        franchiseCode: true,
        deliveryCity: true,
        deliveryState: true,
        createdAt: true,
        items: { select: { name: true, productCode: true, unitCount: true, unitSize: true, total: true, selectedUnitCodes: true } },
        timeline: { orderBy: { createdAt: "asc" }, select: { status: true, title: true, note: true, createdAt: true } },
      },
    })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
