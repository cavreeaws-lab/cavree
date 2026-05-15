import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyResetToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Invalid input. Password must be at least 6 characters." }, { status: 400 })
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
