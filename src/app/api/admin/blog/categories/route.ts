import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ categories })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const category = await prisma.blogCategory.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        description: body.description || null,
        isActive: body.isActive ?? true,
      },
    })
    await logActivity({
      userId: session.userId as string,
      action: "CREATE",
      entity: "BlogCategory",
      entityId: category.id,
      details: { name: category.name },
    })
    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
