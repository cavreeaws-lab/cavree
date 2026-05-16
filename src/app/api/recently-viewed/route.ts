import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth()
    const items = await prisma.recentlyViewed.findMany({
      where: { userId: session.userId as string },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        product: {
          include: { images: { take: 1 }, category: { select: { name: true } } },
        },
      },
    })
    return NextResponse.json({ products: items.map((i: any) => i.product) })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ products: [] })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId: session.userId as string, productId: body.productId } },
      update: { createdAt: new Date() },
      create: { userId: session.userId as string, productId: body.productId },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
