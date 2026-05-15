import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    await requireAuth(["SUPER_ADMIN"])

    const [totalUsers, totalFranchises, totalOrders, totalRevenue, totalProducts] = await Promise.all([
      prisma.user.count(),
      prisma.franchise.count(),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: { notIn: ["CANCELLED", "RETURNED"] } }, _sum: { total: true } }),
      prisma.product.count(),
    ])

    return NextResponse.json({
      stats: { totalUsers, totalFranchises, totalOrders, totalRevenue: totalRevenue._sum.total || 0, totalProducts },
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
