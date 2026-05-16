import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyResetToken } from "@/lib/auth"
import { validate, passwordSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token." }, { status: 400 })
    }

    const validation = validate(passwordSchema, password)
    if (!validation.success) {
      return NextResponse.json({ error: "Password must be at least 8 characters with uppercase, lowercase, and a number." }, { status: 400 })
    }

    const payload = await verifyResetToken(token)

    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { id: payload.userId as string },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
