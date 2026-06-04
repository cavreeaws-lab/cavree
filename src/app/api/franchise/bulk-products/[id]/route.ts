import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const scope = await getAdminScope(session)
    const where: any = {
      isActive: true,
      OR: [
        { id: params.id },
        { slug: params.id },
        { productId: params.id },
      ],
    }
    if (scope.franchiseId) {
      where.franchiseId = scope.franchiseId
    }
    const product = await prisma.bulkProduct.findFirst({
      where,
      include: {
        units: {
          where: { status: "AVAILABLE" },
          orderBy: { unitCode: "asc" },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
