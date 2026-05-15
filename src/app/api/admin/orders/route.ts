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
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: any = { franchiseId }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          user: { select: { name: true, email: true } },
          payment: true,
          address: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
