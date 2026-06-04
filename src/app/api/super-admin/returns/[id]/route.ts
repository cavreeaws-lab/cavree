import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()

    const ret = await prisma.returnRequest.update({
      where: { id: params.id },
      data: {
        status: body.status,
        arbitrationDecision: body.arbitrationDecision || null,
        arbitrationNote: body.arbitrationNote || null,
        arbitratedAt: new Date(),
        arbitratedBy: session.userId as string,
      },
    })

    if (body.status === "APPROVED" || body.status === "REJECTED") {
      const orderStatus = body.status === "APPROVED" ? "RETURNED" : "DELIVERED"
      const paymentStatus = body.status === "APPROVED" ? "REFUNDED" : "COMPLETED"
      await prisma.order.update({
        where: { id: ret.orderId },
        data: { status: orderStatus },
      })
      await prisma.payment.updateMany({
        where: { orderId: ret.orderId },
        data: { status: paymentStatus },
      })
    }

    await logActivity({
      userId: session.userId as string,
      action: "ARBITRATE",
      entity: "ReturnRequest",
      entityId: ret.id,
      details: { status: body.status, decision: body.arbitrationDecision },
    })

    return NextResponse.json({ returnRequest: ret })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
