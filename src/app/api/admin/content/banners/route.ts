import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json({ banners })
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
    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        ctaLabel: body.ctaLabel || null,
        image: body.image,
        link: body.link || null,
        position: body.position || "HOME_TOP",
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json({ banner }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
