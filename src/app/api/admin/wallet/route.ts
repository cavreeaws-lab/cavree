import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const scope = await getAdminScope(session)
    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: any = scope.franchiseId ? { franchiseId: scope.franchiseId } : {}

    const [transactions, total, balanceAgg] = await Promise.all([
      prisma.franchiseWalletTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.franchiseWalletTransaction.count({ where }),
      prisma.franchiseWalletTransaction.aggregate({
        where: { ...where, status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ])

    return NextResponse.json({
      transactions,
      total,
      page,
      limit,
      balance: balanceAgg._sum.amount || 0,
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const { franchiseId, amount, type, description, orderId } = body

    if (!franchiseId || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const tx = await prisma.franchiseWalletTransaction.create({
      data: {
        franchiseId,
        amount,
        type,
        description: description || null,
        orderId: orderId || null,
        status: "COMPLETED",
      },
    })

    return NextResponse.json({ transaction: tx }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
