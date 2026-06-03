import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"
import { retailerSchema, validate } from "@/lib/validators"

export const dynamic = "force-dynamic"

function makeFranchiseCode(name: string) {
  const base = name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8) || "CAVREE"
  return `${base}-${Date.now().toString(36).toUpperCase().slice(-5)}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const where: any = {}
    if (scope.franchiseId) where.franchiseId = scope.franchiseId
    if (status && status !== "ALL") where.status = status
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { ownerName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { franchiseCode: { contains: search, mode: "insensitive" } },
      ]
    }
    const retailers = await prisma.retailer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        salesExecutive: { select: { id: true, name: true, email: true } },
        franchise: { select: { id: true, name: true } },
        _count: { select: { bulkOrders: true } },
      },
    })
    return NextResponse.json({ retailers })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(retailerSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const retailer = await prisma.retailer.create({
      data: {
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        gstNumber: data.gstNumber || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        categoryInterests: data.categoryInterests || [],
        membershipTier: data.membershipTier || "STANDARD",
        status: data.status || "ACTIVE",
        franchiseCode: data.franchiseCode || makeFranchiseCode(data.businessName),
        paymentStatus: data.paymentStatus || "PENDING",
        agreementStatus: data.agreementStatus || "PENDING",
        renewalStatus: data.renewalStatus || "NOT_DUE",
        warehouseStockValue: data.warehouseStockValue || 0,
        salesExecutiveId: data.salesExecutiveId || null,
        franchiseId: data.franchiseId || null,
        notes: data.notes || null,
      },
    })
    await logActivity({
      userId: session.userId as string,
      action: "CREATE",
      entity: "Retailer",
      entityId: retailer.id,
      details: { businessName: retailer.businessName, franchiseCode: retailer.franchiseCode },
    })
    return NextResponse.json({ retailer }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Retailer create error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
