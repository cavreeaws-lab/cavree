import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, settingsUpdateSchema } from "@/lib/validators"

export async function GET() {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const franchise = await prisma.franchise.findFirst({
      where: { ownerId: session.userId as string },
    })
    if (!franchise) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 })
    }
    return NextResponse.json({ franchise })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(settingsUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const franchise = await prisma.franchise.findFirst({ where: { ownerId: session.userId as string } })
    if (!franchise) {
      return NextResponse.json({ error: "Franchise not found" }, { status: 404 })
    }
    const updated = await prisma.franchise.update({
      where: { id: franchise.id },
      data: validation.data,
    })
    return NextResponse.json({ franchise: updated })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
