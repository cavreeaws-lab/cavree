import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["SUPER_ADMIN"])

    const [totalUsers, totalFranchises, totalOrders, totalRevenue, totalProducts, topFranchises] = await Promise.all([
      prisma.user.count(),
      prisma.franchise.count(),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: { notIn: ["CANCELLED", "RETURNED"] } }, _sum: { total: true } }),
      prisma.product.count(),
      prisma.franchise.findMany({
        take: 5,
        include: {
          _count: { select: { orders: true } },
          orders: {
            where: { status: { notIn: ["CANCELLED", "RETURNED"] } },
            select: { total: true },
          },
        },
      }),
    ])

    const topFranchisesData = topFranchises.map((f: any) => {
      const revenue = f.orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      return {
        name: f.name,
        revenue,
        orders: f._count.orders,
        commission: revenue * (f.commission / 100),
      }
    }).sort((a: any, b: any) => b.revenue - a.revenue)

    return NextResponse.json({
      stats: { totalUsers, totalFranchises, totalOrders, totalRevenue: totalRevenue._sum?.total || 0, totalProducts },
      topFranchises: topFranchisesData,
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
