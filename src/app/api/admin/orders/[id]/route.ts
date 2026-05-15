import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, orderStatusUpdateSchema } from "@/lib/validators"

async function getFranchiseId(userId: string) {
  const franchise = await prisma.franchise.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  })
  return franchise?.id
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const franchiseId = await getFranchiseId(session.userId as string)

    const existing = await prisma.order.findFirst({
      where: { id: params.id, franchiseId: franchiseId || undefined },
    })
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const body = await request.json()
    const validation = validate(orderStatusUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: validation.data.status },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
        payment: true,
      },
    })

    return NextResponse.json({ order })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
