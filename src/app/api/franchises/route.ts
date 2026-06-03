import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    const where: any = { isActive: true, isApproved: true }
    if (city) {
      where.city = { contains: city, mode: "insensitive" }
    }

    const franchises = await prisma.franchise.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        banner: true,
        city: true,
        state: true,
        address: true,
        phone: true,
        email: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ franchises })
  } catch (error) {
    console.error("Franchises list error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
