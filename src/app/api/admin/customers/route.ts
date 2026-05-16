import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

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
    const franchiseId = session.role === "FRANCHISEE" ? await getFranchiseId(session.userId as string) : undefined
    if (session.role === "FRANCHISEE" && !franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const orderWhere: any = franchiseId ? { franchiseId } : {}

    // Aggregate customer stats from orders
    const customerStats = await prisma.order.groupBy({
      by: ["userId"],
      where: orderWhere,
      _count: { userId: true },
      _sum: { total: true },
    })

    const userIds = customerStats.map((s: any) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, phone: true },
    })

    const userMap = new Map(users.map((u: any) => [u.id, u]))

    const customers = customerStats
      .map((s: any) => {
        const u = userMap.get(s.userId)
        return {
          id: s.userId,
          name: u?.name || "",
          email: u?.email || "",
          phone: u?.phone || "",
          orders: s._count.userId,
          totalSpent: s._sum.total || 0,
        }
      })
      .slice((page - 1) * limit, page * limit)

    return NextResponse.json({ customers, total: customerStats.length, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
