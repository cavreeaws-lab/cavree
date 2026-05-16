import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth()
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId as string },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                franchise: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    if (!wishlist) {
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json({ items: wishlist.items })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId as string },
    })

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.userId as string },
      })
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ message: "Already in wishlist" })
    }

    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    })

    return NextResponse.json({ message: "Added to wishlist" }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
