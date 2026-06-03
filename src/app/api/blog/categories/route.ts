import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ categories })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
