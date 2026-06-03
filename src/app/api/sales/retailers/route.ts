import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"])
    const retailers = await prisma.retailer.findMany({
      where: session.role === "SALES_EXECUTIVE" ? { salesExecutiveId: session.userId as string } : {},
      orderBy: { businessName: "asc" },
      include: { bulkOrders: { orderBy: { createdAt: "desc" }, take: 3 } },
    })
    return NextResponse.json({ retailers })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
