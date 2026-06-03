import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const userId = session.userId as string
    const isFranchise = session.role === "FRANCHISEE"

    const [franchise, orders, cart, products] = await Promise.all([
      prisma.franchise.findFirst({ where: isFranchise ? { ownerId: userId } : {}, orderBy: { createdAt: "desc" } }),
      prisma.order.findMany({
        where: isFranchise ? { userId } : {},
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
      prisma.cart.findUnique({ where: { userId }, include: { items: true } }),
      prisma.product.count({ where: { isActive: true, ...(isFranchise && franchise?.id ? { franchiseId: franchise.id } : {}) } }),
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
        cartItems: cart?.items.length || 0,
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
