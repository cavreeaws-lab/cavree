import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get("days") || "30"), 365)
    const now = new Date()
    const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const where: any = scope.franchiseId ? { franchiseId: scope.franchiseId } : {}
    const orderWhere: any = scope.franchiseId ? { franchiseId: scope.franchiseId, status: { notIn: ["CANCELLED", "RETURNED"] } } : { status: { notIn: ["CANCELLED", "RETURNED"] } }
    const itemWhere: any = {
      productId: { not: null },
      ...(scope.franchiseId ? { order: { franchiseId: scope.franchiseId } } : {}),
    }

    const [totalOrders, totalRevenue, totalProducts, totalCustomers, recentOrders, topProducts, rangeOrders, activity] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: orderWhere,
        _sum: { total: true },
      }),
      prisma.product.count({ where }),
      prisma.order.groupBy({
        by: ["userId"],
        where,
        _count: { userId: true },
      }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: true,
          user: { select: { name: true } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: itemWhere,
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        where: { ...orderWhere, createdAt: { gte: rangeStart } },
        select: { createdAt: true, total: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])

    // Get product names for top products
    const topProductIds = topProducts.map((p: any) => p.productId).filter(Boolean)
    const productNames = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true },
    })
    const productNameMap = new Map(productNames.map((p: any) => [p.id, p.name]))
    const seriesLength = Math.min(days, 31)
    const salesSeries = Array.from({ length: seriesLength }).map((_, index) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (seriesLength - 1 - index))
      const date = d.toISOString().slice(0, 10)
      const dayOrders = rangeOrders.filter((order) => order.createdAt.toISOString().slice(0, 10) === date)
      return {
        date,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
      }
    })
    const statusCounts = rangeOrders.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum?.total || 0,
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
      salesSeries,
      orderStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      activity,
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
