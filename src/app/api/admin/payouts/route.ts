import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = scope.franchiseId ? { franchiseId: scope.franchiseId } : {}
    if (status) where.status = status

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          franchise: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.payout.count({ where }),
    ])

    return NextResponse.json({ payouts, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE"])
    const body = await request.json()
    const { amount, method, accountDetails } = body
    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })

    const franchise = await prisma.franchise.findFirst({
      where: { ownerId: session.userId as string },
      select: { id: true },
    })
    if (!franchise) return NextResponse.json({ error: "No franchise found" }, { status: 400 })

    const payout = await prisma.$transaction(async (tx: any) => {
      const [ordersAgg, payoutsAgg] = await Promise.all([
        tx.order.aggregate({
          where: {
            franchiseId: franchise.id,
            status: { notIn: ["CANCELLED", "RETURNED", "REFUNDED"] },
            payment: { is: { status: "COMPLETED" } },
          },
          _sum: { total: true },
        }),
        tx.payout.aggregate({
          where: { franchiseId: franchise.id, status: { in: ["PENDING", "APPROVED", "PAID"] } },
          _sum: { amount: true },
        }),
      ])
      const franchiseRecord = await tx.franchise.findUnique({ where: { id: franchise.id }, select: { commission: true } })
      const grossCompleted = ordersAgg._sum.total || 0
      const commissionRate = (franchiseRecord?.commission || 10) / 100
      const available = Math.max(0, grossCompleted - grossCompleted * commissionRate - (payoutsAgg._sum.amount || 0))
      if (available < amount) {
        throw new Error("Insufficient balance")
      }
      return await tx.payout.create({
        data: {
          amount,
          method: method || "BANK_TRANSFER",
          accountDetails: accountDetails || null,
          status: "PENDING",
          franchiseId: franchise.id,
          userId: session.userId as string,
        },
      })
    })
    await logActivity({
      userId: session.userId as string,
      action: "REQUEST",
      entity: "Payout",
      entityId: payout.id,
      details: { amount },
    })

    return NextResponse.json({ payout }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Insufficient balance") {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
