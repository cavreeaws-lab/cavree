import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, phone: true, role: true, image: true, createdAt: true },
    })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const [orders, totalSpentAgg, addresses, notes] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: true, payment: true },
      }),
      prisma.order.aggregate({ where: { userId: user.id, status: { notIn: ["CANCELLED", "RETURNED"] } }, _sum: { total: true } }),
      prisma.address.findMany({ where: { userId: user.id } }),
      prisma.customerNote.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    ])

    return NextResponse.json({
      customer: { ...user, totalSpent: totalSpentAgg._sum?.total || 0, orderCount: orders.length },
      orders,
      addresses,
      notes,
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
