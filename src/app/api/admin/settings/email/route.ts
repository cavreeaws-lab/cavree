import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const setting = await prisma.setting.findUnique({ where: { key: "email_smtp" } })
    return NextResponse.json({ config: setting?.value ? JSON.parse(setting.value as string) : null })
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
    await prisma.setting.upsert({
      where: { key: "email_smtp" },
      update: { value: JSON.stringify(body) },
      create: { key: "email_smtp", value: JSON.stringify(body) },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
