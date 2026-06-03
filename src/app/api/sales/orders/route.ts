import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"])
    const orders = await prisma.bulkOrder.findMany({
      where: session.role === "SALES_EXECUTIVE" ? { retailer: { salesExecutiveId: session.userId as string } } : {},
      orderBy: { createdAt: "desc" },
      include: { retailer: true, items: true, timeline: { orderBy: { createdAt: "asc" } } },
    })
    return NextResponse.json({ orders })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
