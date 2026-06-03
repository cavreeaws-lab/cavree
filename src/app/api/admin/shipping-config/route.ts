import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const scope = await getAdminScope(session)
    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const config = await prisma.vendorShippingConfig.findFirst({
      where: scope.franchiseId ? { franchiseId: scope.franchiseId } : {},
    })
    return NextResponse.json({ config })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const body = await request.json()
    const franchiseId = scope.franchiseId || body.franchiseId
    if (!franchiseId) {
      return NextResponse.json({ error: "Franchise ID required" }, { status: 400 })
    }

    const config = await prisma.vendorShippingConfig.upsert({
      where: { franchiseId },
      update: {
        name: body.name,
        zones: body.zones || [],
        freeShippingThreshold: body.freeShippingThreshold ?? null,
        isActive: body.isActive ?? true,
      },
      create: {
        name: body.name,
        zones: body.zones || [],
        freeShippingThreshold: body.freeShippingThreshold ?? null,
        franchiseId,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json({ config })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
