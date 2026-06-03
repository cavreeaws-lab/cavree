import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const view = searchParams.get("view")

    const where: any = { isActive: true }
    if (category && category !== "ALL") where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { productId: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const products = await prisma.bulkProduct.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        units: {
          where: { status: "AVAILABLE" },
          take: view === "detail" ? 100 : 0,
          orderBy: { unitCode: "asc" },
        },
      },
    })

    return NextResponse.json({ products })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
