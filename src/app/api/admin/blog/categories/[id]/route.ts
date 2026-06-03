import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const category = await prisma.blogCategory.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        isActive: body.isActive,
      },
    })
    await logActivity({
      userId: session.userId as string,
      action: "UPDATE",
      entity: "BlogCategory",
      entityId: category.id,
      details: { name: category.name },
    })
    return NextResponse.json({ category })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    await prisma.blogCategory.delete({ where: { id: params.id } })
    await logActivity({
      userId: session.userId as string,
      action: "DELETE",
      entity: "BlogCategory",
      entityId: params.id,
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
