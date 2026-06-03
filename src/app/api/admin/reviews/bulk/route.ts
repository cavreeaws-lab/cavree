import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"
import { z } from "zod"

export const dynamic = "force-dynamic"

const schema = z.object({
  reviewIds: z.array(z.string().min(1)).min(1),
  action: z.enum(["APPROVE", "REJECT", "DELETE"]),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const result = schema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const where: any = { id: { in: result.data.reviewIds } }
    if (scope.franchiseId) where.product = { franchiseId: scope.franchiseId }

    let count = 0
    if (result.data.action === "DELETE") {
      const deleted = await prisma.review.deleteMany({ where })
      count = deleted.count
    } else {
      const updated = await prisma.review.updateMany({
        where,
        data: { isApproved: result.data.action === "APPROVE" },
      })
      count = updated.count
    }

    await logActivity({
      userId: scope.userId,
      action: `BULK_${result.data.action}`,
      entity: "Review",
      details: { count },
    })

    return NextResponse.json({ count })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
