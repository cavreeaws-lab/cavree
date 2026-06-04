import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const scope = await getAdminScope(session)

    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const franchise = scope.franchiseId
      ? await prisma.franchise.findUnique({ where: { id: scope.franchiseId } })
      : null

    const where: any = scope.franchiseId ? { franchiseId: scope.franchiseId } : {}
    const [orders, products] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          ...(scope.franchiseId ? { franchiseId: scope.franchiseId } : {}),
        },
      }),
    ])

    const totalSpend = orders.reduce((sum, order) => sum + order.total, 0)
    const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0)

    return NextResponse.json({
      profile: {
        name: franchise?.name || "Franchise Account",
        ownerName: franchise?.name,
        franchiseCode: franchise?.slug || "CAVREE",
        franchiseSlug: franchise?.slug,
        status: franchise?.isApproved ? "ACTIVE" : "PENDING",
        city: franchise?.city,
        state: franchise?.state,
        phone: franchise?.phone,
        email: franchise?.email,
      },
      stats: {
        orders: orders.length,
        totalSpend,
        totalItems,
        cartItems: 0,
        activeProducts: products,
      },
      recentOrders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        totalItems: order.items.reduce((s, item) => s + item.quantity, 0),
      })),
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Franchise dashboard error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
