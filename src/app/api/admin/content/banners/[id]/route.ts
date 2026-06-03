import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        ctaLabel: body.ctaLabel || null,
        image: body.image,
        link: body.link,
        position: body.position,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    })
    return NextResponse.json({ banner })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    await prisma.banner.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
