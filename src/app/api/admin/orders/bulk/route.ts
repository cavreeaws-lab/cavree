import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, bulkOrderStatusSchema } from "@/lib/validators"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const body = await request.json()
    const validation = validate(bulkOrderStatusSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }

    const where: any = { id: { in: validation.data.orderIds } }
    if (scope.franchiseId) where.franchiseId = scope.franchiseId
    const result = await prisma.order.updateMany({
      where,
      data: { status: validation.data.status },
    })

    await logActivity({
      userId: scope.userId,
      action: "BULK_STATUS_UPDATE",
      entity: "Order",
      details: { count: result.count, status: validation.data.status },
    })

    return NextResponse.json({ updated: result.count })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
