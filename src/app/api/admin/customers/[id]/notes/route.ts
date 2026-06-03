import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const body = await request.json()
    if (!body.note) return NextResponse.json({ error: "Note required" }, { status: 400 })
    if (scope.franchiseId) {
      const hasOrder = await prisma.order.findFirst({
        where: { userId: params.id, franchiseId: scope.franchiseId },
        select: { id: true },
      })
      if (!hasOrder) return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const note = await prisma.customerNote.create({
      data: { note: body.note, userId: params.id, createdBy: session.userId as string },
    })
    await logActivity({ userId: scope.userId, action: "CREATE_NOTE", entity: "Customer", entityId: params.id })
    return NextResponse.json({ note }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
