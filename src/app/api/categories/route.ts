import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, image: true },
        },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
