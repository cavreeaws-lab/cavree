import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: { isActive: true },
      select: { title: true, slug: true },
      orderBy: { title: "asc" },
    })
    return NextResponse.json({ pages })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
