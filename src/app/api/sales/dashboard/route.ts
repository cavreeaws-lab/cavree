import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"])
    const userId = session.userId as string
    const scoped = session.role === "SALES_EXECUTIVE"
    const retailerWhere = scoped ? { salesExecutiveId: userId } : {}
    const [retailers, orders, products] = await Promise.all([
      prisma.retailer.findMany({ where: retailerWhere, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.bulkOrder.findMany({
        where: scoped ? { retailer: { salesExecutiveId: userId } } : {},
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { retailer: true },
      }),
      prisma.bulkProduct.count({ where: { isActive: true } }),
    ])
    const revenue = orders.reduce((sum, order) => sum + order.total, 0)
    return NextResponse.json({
      stats: { retailers: retailers.length, recentOrders: orders.length, revenue, products },
      retailers,
      orders,
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
