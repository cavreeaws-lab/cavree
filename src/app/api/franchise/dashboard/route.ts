import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const userId = session.userId as string
    const isFranchise = session.role === "FRANCHISEE"

    const [franchise, retailer, orders, cart, products] = await Promise.all([
      prisma.franchise.findFirst({ where: isFranchise ? { ownerId: userId } : {}, orderBy: { createdAt: "desc" } }),
      prisma.retailer.findFirst({ where: isFranchise ? { userId } : {}, orderBy: { createdAt: "desc" } }),
      prisma.bulkOrder.findMany({
        where: isFranchise ? { userId } : {},
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
      prisma.bulkCart.findUnique({ where: { userId }, include: { items: true } }),
      prisma.bulkProduct.count({ where: { isActive: true } }),
    ])

    const totalSpend = orders.reduce((sum, order) => sum + order.total, 0)
    const totalUnits = orders.reduce((sum, order) => sum + order.totalUnits, 0)

    return NextResponse.json({
      profile: {
        name: retailer?.businessName || franchise?.name || "Franchise Account",
        ownerName: retailer?.ownerName || franchise?.name,
        franchiseCode: retailer?.franchiseCode || franchise?.slug || "CAVREE",
        franchiseSlug: franchise?.slug,
        status: retailer?.status || (franchise?.isApproved ? "ACTIVE" : "PENDING"),
        city: retailer?.city || franchise?.city,
        state: retailer?.state || franchise?.state,
        phone: retailer?.phone || franchise?.phone,
        email: retailer?.email || franchise?.email,
      },
      stats: {
        orders: orders.length,
        totalSpend,
        totalUnits,
        cartItems: cart?.items.length || 0,
        activeBulkProducts: products,
      },
      recentOrders: orders,
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Franchise dashboard error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
