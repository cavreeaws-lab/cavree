import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

async function getFranchiseId(userId: string) {
  const franchise = await prisma.franchise.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  })
  return franchise?.id
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const franchiseId = await getFranchiseId(session.userId as string)
    if (!franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [totalOrders, totalRevenue, totalProducts, totalCustomers, recentOrders, topProducts] = await Promise.all([
      prisma.order.count({ where: { franchiseId } }),
      prisma.order.aggregate({
        where: { franchiseId, status: { notIn: ["CANCELLED", "RETURNED"] } },
        _sum: { total: true },
      }),
      prisma.product.count({ where: { franchiseId } }),
      prisma.order.groupBy({
        by: ["userId"],
        where: { franchiseId },
        _count: { userId: true },
      }),
      prisma.order.findMany({
        where: { franchiseId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: true,
          user: { select: { name: true } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { franchiseId } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ])

    // Get product names for top products
    const topProductIds = topProducts.map((p: any) => p.productId)
    const productNames = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true },
    })
    const productNameMap = new Map(productNames.map((p: any) => [p.id, p.name]))

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
        totalCustomers: totalCustomers.length,
      },
      recentOrders,
      topProducts: topProducts.map((p: any) => ({
        productId: p.productId,
        name: productNameMap.get(p.productId) || "Unknown",
        quantity: p._sum.quantity || 0,
        revenue: p._sum.total || 0,
      })),
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
