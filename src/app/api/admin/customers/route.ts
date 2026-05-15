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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Get distinct customers who ordered from this franchise
    const orders = await prisma.order.findMany({
      where: { franchiseId },
      distinct: ["userId"],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            _count: { select: { orders: true } },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const customers = orders.map((o: any) => ({
      id: o.user.id,
      name: o.user.name,
      email: o.user.email,
      phone: o.user.phone,
      orders: o.user._count.orders,
    }))

    const total = await prisma.order.groupBy({
      by: ["userId"],
      where: { franchiseId },
      _count: { userId: true },
    })

    return NextResponse.json({ customers, total: total.length, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
