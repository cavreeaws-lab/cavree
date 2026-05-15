import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createResetToken } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      // Don't reveal whether user exists
      return NextResponse.json({ message: "If an account exists, a reset link has been sent" })
    }

    const token = await createResetToken(user.id)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not set")
      return NextResponse.json({ error: "Configuration error" }, { status: 500 })
    }

    const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`

    await sendPasswordResetEmail({ to: user.email, resetUrl })

    return NextResponse.json({ message: "If an account exists, a reset link has been sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
