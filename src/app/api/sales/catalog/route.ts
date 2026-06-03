import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"])
    const products = await prisma.bulkProduct.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        productId: true,
        name: true,
        category: true,
        wholesalePrice: true,
        singlePiecePrice: true,
        unitSize: true,
        minUnits: true,
        availableUnits: true,
        image: true,
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
