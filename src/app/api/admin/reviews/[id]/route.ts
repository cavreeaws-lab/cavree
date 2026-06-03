import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const body = await request.json()
    const { isApproved } = body

    if (typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "isApproved must be a boolean" }, { status: 400 })
    }

    const existing = await prisma.review.findFirst({
      where: { id: params.id, product: scope.franchiseId ? { franchiseId: scope.franchiseId } : undefined },
    })
    if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 })

    const review = await prisma.review.update({
      where: { id: existing.id },
      data: { isApproved },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
      },
    })
    await logActivity({
      userId: scope.userId,
      action: isApproved ? "APPROVE" : "REJECT",
      entity: "Review",
      entityId: review.id,
    })

    return NextResponse.json({ review })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const existing = await prisma.review.findFirst({
      where: { id: params.id, product: scope.franchiseId ? { franchiseId: scope.franchiseId } : undefined },
    })
    if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 })
    await prisma.review.delete({ where: { id: existing.id } })
    await logActivity({ userId: scope.userId, action: "DELETE", entity: "Review", entityId: existing.id })
    return NextResponse.json({ message: "Review deleted" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
