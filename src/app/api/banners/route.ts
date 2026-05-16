import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json({ banners })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
