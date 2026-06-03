import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, requireAuth } from "@/lib/auth"
import { logActivity } from "@/lib/admin"
import { salesExecutiveSchema, validate } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const where: any = { role: "SALES_EXECUTIVE" }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }
    const executives = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        assignedRetailers: { select: { id: true, businessName: true, status: true } },
        commissionCredits: { select: { amount: true, status: true } },
      },
    })
    return NextResponse.json({ executives })
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
    const validation = validate(salesExecutiveSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const password = data.password || `Cavree${Math.random().toString(36).slice(2, 8)}1A`
    const executive = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: await hashPassword(password),
        role: "SALES_EXECUTIVE",
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    })
    await logActivity({
      userId: session.userId as string,
      action: "CREATE",
      entity: "SalesExecutive",
      entityId: executive.id,
      details: { email: executive.email },
    })
    return NextResponse.json({ executive, temporaryPassword: data.password ? undefined : password }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Sales executive create error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
