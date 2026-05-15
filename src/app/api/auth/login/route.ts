import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createSession } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { validate, loginSchema } from "@/lib/validators"

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, 5, 60 * 1000)
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
    const body = await request.json()
    const validation = validate(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { email, password } = validation.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    await createSession(user.id, user.email, user.role)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
