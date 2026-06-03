import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, 5, 60 * 1000)
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
    const session = await requireAuth()
    const body = await request.json()
    const { productId, rating, comment } = body

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // Customers can review only after the order is fully completed.
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.userId as string,
          status: "DELIVERED",
          payment: { status: "COMPLETED" },
        },
      },
    })

    if (!hasOrdered) {
      return NextResponse.json(
        { error: "You can review this product after your completed order is delivered" },
        { status: 403 }
      )
    }

    // Check if already reviewed
    const existing = await prisma.review.findFirst({
      where: { productId, userId: session.userId as string },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.userId as string,
        rating,
        comment: comment || "",
      },
      include: { user: { select: { name: true } } },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Review error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
