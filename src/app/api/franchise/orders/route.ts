import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const where = session.role === "FRANCHISEE" ? { userId: session.userId as string } : {}
    const orders = await prisma.bulkOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true, timeline: { orderBy: { createdAt: "asc" } } },
    })
    return NextResponse.json({ orders })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
