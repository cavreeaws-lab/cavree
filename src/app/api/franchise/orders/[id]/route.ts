import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const order = await prisma.bulkOrder.findUnique({
      where: { id: params.id },
      include: {
        items: { include: { product: true } },
        timeline: { orderBy: { createdAt: "asc" } },
        retailer: true,
      },
    })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    if (session.role === "FRANCHISEE" && order.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ order })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
