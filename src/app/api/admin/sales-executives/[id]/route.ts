import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, requireAuth } from "@/lib/auth"
import { salesExecutiveSchema, validate } from "@/lib/validators"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(salesExecutiveSchema.partial(), body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const existing = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } })
    if (existing?.role !== "SALES_EXECUTIVE") {
      return NextResponse.json({ error: "Sales executive not found" }, { status: 404 })
    }
    const executive = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password ? await hashPassword(data.password) : undefined,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    })
    await logActivity({
      userId: session.userId as string,
      action: "UPDATE",
      entity: "SalesExecutive",
      entityId: executive.id,
      details: { email: executive.email },
    })
    return NextResponse.json({ executive })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Sales executive update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
