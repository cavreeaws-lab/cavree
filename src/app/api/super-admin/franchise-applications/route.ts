import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["SUPER_ADMIN"])

    const applications = await prisma.franchiseApplication.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ applications })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Franchise applications fetch error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
