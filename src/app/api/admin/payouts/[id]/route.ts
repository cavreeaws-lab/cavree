import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const { status, notes } = body
    if (!status) return NextResponse.json({ error: "Status required" }, { status: 400 })

    const payout = await prisma.payout.update({
      where: { id: params.id },
      data: { status, notes: notes || null },
    })
    await logActivity({
      userId: session.userId as string,
      action: "UPDATE_STATUS",
      entity: "Payout",
      entityId: payout.id,
      details: { status },
    })

    return NextResponse.json({ payout })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
