import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await requireAuth()

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId as string },
    })

    if (!wishlist) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 })
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId: params.productId,
      },
    })

    return NextResponse.json({ message: "Removed from wishlist" })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
