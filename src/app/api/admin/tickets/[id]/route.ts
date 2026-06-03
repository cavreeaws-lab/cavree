import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ ticket })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
