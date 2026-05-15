import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate } from "@/lib/validators"
import { z } from "zod"

const contentSchema = z.object({
  key: z.string().min(1),
  type: z.enum(["TEXT", "HTML", "IMAGE"]).optional(),
  content: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET() {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const blocks = await prisma.contentBlock.findMany({ orderBy: { key: "asc" } })
    return NextResponse.json({ blocks })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(contentSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const data = validation.data
    const block = await prisma.contentBlock.create({
      data: {
        key: data.key,
        type: data.type ?? "TEXT",
        content: data.content,
        isActive: data.isActive ?? true,
      },
    })
    return NextResponse.json({ block }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
