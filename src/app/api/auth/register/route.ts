import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { validate, registerSchema } from "@/lib/validators"

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, 3, 60 * 1000)
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
    const body = await request.json()
    const validation = validate(registerSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { email, password, name, phone, role = "CUSTOMER" } = validation.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
