import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const scope = await getAdminScope(session)
    const order = await prisma.bulkOrder.findUnique({
      where: { id: params.id },
      include: {
        items: { include: { product: true } },
        timeline: { orderBy: { createdAt: "asc" } },
        retailer: true,
      },
    })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN"
    const ownsOrder = order.userId === session.userId
    const belongsToFranchise = scope.franchiseId && order.retailer?.franchiseId === scope.franchiseId
    if (!isAdmin && !ownsOrder && !belongsToFranchise) {
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
