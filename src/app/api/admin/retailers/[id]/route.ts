import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { retailerSchema, validate } from "@/lib/validators"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(retailerSchema.partial(), body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const retailer = await prisma.retailer.update({
      where: { id: params.id },
      data: {
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        gstNumber: data.gstNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        categoryInterests: data.categoryInterests,
        membershipTier: data.membershipTier,
        status: data.status,
        franchiseCode: data.franchiseCode,
        paymentStatus: data.paymentStatus,
        agreementStatus: data.agreementStatus,
        renewalStatus: data.renewalStatus,
        warehouseStockValue: data.warehouseStockValue,
        salesExecutiveId: data.salesExecutiveId || null,
        franchiseId: data.franchiseId || null,
        notes: data.notes,
      },
    })
    await logActivity({
      userId: session.userId as string,
      action: "UPDATE",
      entity: "Retailer",
      entityId: retailer.id,
      details: { businessName: retailer.businessName, status: retailer.status },
    })
    return NextResponse.json({ retailer })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Retailer update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
