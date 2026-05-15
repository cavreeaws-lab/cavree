import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, hashPassword } from "@/lib/auth"
import { validate, createUserSchema } from "@/lib/validators"

export async function GET() {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        createdAt: true, _count: { select: { orders: true } },
      },
    })
    return NextResponse.json({ users })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(createUserSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { name, email, password, role = "CUSTOMER", phone } = validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        phone,
      },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    })
    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
