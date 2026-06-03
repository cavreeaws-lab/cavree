import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        category: true,
        franchise: true,
        images: { orderBy: { sortOrder: "asc" } },
        media: { orderBy: { sortOrder: "asc" } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      product: {
        ...product,
        media: product.media.length > 0
          ? product.media
          : product.images.map((image) => ({ ...image, type: "IMAGE", posterUrl: null })),
      },
    })
  } catch (error) {
    console.error("Product detail error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
