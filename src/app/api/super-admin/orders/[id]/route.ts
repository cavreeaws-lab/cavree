import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, orderStatusUpdateSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } },
        address: true,
        payment: true,
        shippingDetail: true,
        franchise: { select: { name: true } },
      },
    })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ order })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(orderStatusUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: validation.data.status },
    })
    return NextResponse.json({ order })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    await prisma.order.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
