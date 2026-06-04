import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"
import { hashPassword } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const scope = await getAdminScope(session)
    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const where: any = scope.franchiseId ? { franchiseId: scope.franchiseId } : {}
    const staff = await prisma.franchiseStaff.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    })
    return NextResponse.json({ staff })
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
    if (scope.isFranchiseScoped && body.franchiseId && body.franchiseId !== scope.franchiseId) {
      return NextResponse.json({ error: "You can only create staff for your own franchise" }, { status: 403 })
    }

    let userId: string | null = null
    if (body.email && body.password) {
      const existingUser = await prisma.user.findUnique({ where: { email: body.email } })
      if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      }
      const newUser = await prisma.user.create({
        data: {
          email: body.email,
          password: await hashPassword(body.password),
          name: body.name,
          phone: body.phone || null,
          role: "FRANCHISE_STAFF",
        },
      })
      userId = newUser.id
    }

    const staff = await prisma.franchiseStaff.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        role: body.role || "STAFF",
        permissions: body.permissions || [],
        franchiseId,
        userId,
      },
    })

    await logActivity({
      userId: scope.userId,
      action: "CREATE",
      entity: "FranchiseStaff",
      entityId: staff.id,
      details: { name: staff.name, franchiseId },
    })

    return NextResponse.json({ staff }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
