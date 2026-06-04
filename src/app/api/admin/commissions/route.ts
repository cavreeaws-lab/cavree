import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const where = scope.franchiseId ? { franchiseId: scope.franchiseId } : {}
    const [rules, credits] = await Promise.all([
      prisma.commissionRule.findMany({ where, orderBy: { createdAt: "desc" }, include: { franchise: { select: { name: true } } } }),
      prisma.commissionCredit.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { retailer: { select: { businessName: true, franchiseId: true } }, user: { select: { name: true, email: true } } },
      }),
    ])
    const scopedCredits = scope.franchiseId ? credits.filter((credit) => credit.retailer?.franchiseId === scope.franchiseId) : credits
    return NextResponse.json({ rules, credits: scopedCredits })
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
    const rule = await prisma.commissionRule.create({
      data: {
        name: String(body.name || "Commission Rule"),
        rate: Number(body.rate || 0),
        appliesTo: body.appliesTo || "FRANCHISE",
        franchiseId: body.franchiseId || null,
        isActive: body.isActive ?? true,
      },
    })
    await logActivity({
      userId: session.userId as string,
      action: "CREATE",
      entity: "CommissionRule",
      entityId: rule.id,
      details: { name: rule.name, rate: rule.rate },
    })
    return NextResponse.json({ rule }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Commission rule create error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    if (body.creditId) {
      const credit = await prisma.commissionCredit.update({
        where: { id: String(body.creditId) },
        data: { status: (body.status || "APPROVED") as any, notes: body.notes || undefined },
      })
      await logActivity({
        userId: session.userId as string,
        action: "UPDATE_COMMISSION_CREDIT",
        entity: "CommissionCredit",
        entityId: credit.id,
        details: { status: credit.status },
      })
      return NextResponse.json({ credit })
    }
    if (body.ruleId) {
      const rule = await prisma.commissionRule.update({
        where: { id: String(body.ruleId) },
        data: {
          name: body.name,
          rate: body.rate === undefined ? undefined : Number(body.rate),
          appliesTo: body.appliesTo,
          isActive: body.isActive,
        },
      })
      return NextResponse.json({ rule })
    }
    return NextResponse.json({ error: "Rule or credit ID is required" }, { status: 400 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Commission update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
