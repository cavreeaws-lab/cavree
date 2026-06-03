import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createReviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  customerName: z.string().trim().min(2, "Customer name is required"),
  rating: z.number().int().min(1).max(5).default(5),
  comment: z.string().trim().min(3, "Review is required"),
})

function reviewCustomerEmail(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "")
  return `review.${slug || "customer"}@cavree.local`
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = scope.franchiseId ? { product: { franchiseId: scope.franchiseId } } : {}
    if (status === "pending") {
      where.isApproved = false
    } else if (status === "approved") {
      where.isApproved = true
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true, slug: true, images: { take: 1 } } },
        },
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({ reviews, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const result = createReviewSchema.safeParse(await request.json())
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { productId, customerName, rating, comment } = result.data
    const product = await prisma.product.findFirst({
      where: { id: productId, ...(scope.franchiseId ? { franchiseId: scope.franchiseId } : {}) },
      select: { id: true, name: true },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const user = await prisma.user.upsert({
      where: { email: reviewCustomerEmail(customerName) },
      update: { name: customerName, role: "CUSTOMER" },
      create: {
        email: reviewCustomerEmail(customerName),
        name: customerName,
        role: "CUSTOMER",
      },
    })

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating,
        comment,
        isApproved: true,
      },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true, images: { take: 1 } } },
      },
    })

    await logActivity({
      userId: scope.userId,
      action: "CREATE",
      entity: "Review",
      entityId: review.id,
      details: { product: product.name, customerName },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Admin review creation error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
