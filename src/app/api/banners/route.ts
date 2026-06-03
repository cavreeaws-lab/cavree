import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")
    const banners = await prisma.banner.findMany({
      where: { isActive: true, ...(position ? { position } : {}) },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json({ banners })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
