import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate } from "@/lib/validators"
import { z } from "zod"

export const dynamic = "force-dynamic"

const contentUpdateSchema = z.object({
  type: z.enum(["TEXT", "HTML", "IMAGE"]).optional(),
  content: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const body = await request.json()
    const validation = validate(contentUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const block = await prisma.contentBlock.update({
      where: { id: params.id },
      data: validation.data,
    })
    return NextResponse.json({ block })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    await prisma.contentBlock.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Content deleted" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
