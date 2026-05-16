import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const franchiseId = searchParams.get("franchiseId")
    const where: any = {}
    if (status) where.status = status
    if (franchiseId) where.franchiseId = franchiseId
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        user: { select: { name: true, email: true } },
        franchise: { select: { name: true } },
        address: true,
        shippingDetail: true,
      },
    })
    return NextResponse.json({ orders })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
