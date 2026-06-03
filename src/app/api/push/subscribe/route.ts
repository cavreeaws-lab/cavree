import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.userId as string
    const body = await request.json()
    const { endpoint, p256dh, auth } = body

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Missing push subscription data" }, { status: 400 })
    }

    await prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint } },
      update: { p256dh, auth, isActive: true },
      create: { userId, endpoint, p256dh, auth },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
