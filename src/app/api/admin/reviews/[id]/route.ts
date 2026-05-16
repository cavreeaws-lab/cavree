import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const { isApproved } = body

    if (typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "isApproved must be a boolean" }, { status: 400 })
    }

    const review = await prisma.review.update({
      where: { id: params.id },
      data: { isApproved },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
      },
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
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    await prisma.review.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Review deleted" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
