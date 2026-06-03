import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const setting = await prisma.setting.findUnique({
      where: { key: "reviewsEnabled" },
    })
    return NextResponse.json({ enabled: setting?.value !== "false" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()
    const enabled = body.enabled === true ? "true" : "false"
    await prisma.setting.upsert({
      where: { key: "reviewsEnabled" },
      update: { value: enabled },
      create: { key: "reviewsEnabled", value: enabled, group: "FEATURES" },
    })
    return NextResponse.json({ enabled: body.enabled })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
