import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const body = await request.json()

    const existing = await prisma.franchiseStaff.findUnique({
      where: { id: params.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (scope.isFranchiseScoped && existing.franchiseId !== scope.franchiseId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const staff = await prisma.franchiseStaff.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        permissions: body.permissions,
        isActive: body.isActive,
      },
    })

    await logActivity({
      userId: scope.userId,
      action: "UPDATE",
      entity: "FranchiseStaff",
      entityId: staff.id,
    })

    return NextResponse.json({ staff })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)

    const existing = await prisma.franchiseStaff.findUnique({
      where: { id: params.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (scope.isFranchiseScoped && existing.franchiseId !== scope.franchiseId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.franchiseStaff.delete({ where: { id: params.id } })
    await logActivity({
      userId: scope.userId,
      action: "DELETE",
      entity: "FranchiseStaff",
      entityId: params.id,
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
