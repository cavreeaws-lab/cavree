import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, hashPassword } from "@/lib/auth"
import { validate, createUserSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(createUserSchema.partial(), body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data: any = { ...validation.data }
    if (data.password) {
      data.password = await hashPassword(data.password)
    } else {
      delete data.password
    }
    if (data.email) {
      data.email = data.email.toLowerCase().trim()
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    })
    return NextResponse.json({ user })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
