import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ pages })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const page = await prisma.page.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json({ page }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
