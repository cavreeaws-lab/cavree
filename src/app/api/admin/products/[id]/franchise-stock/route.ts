import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const product = await prisma.product.findFirst({
      where: { id: params.id },
      include: {
        productStocks: {
          include: {
            franchise: { select: { id: true, name: true, slug: true, city: true } },
          },
        },
      },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ stocks: product.productStocks || [] })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const body = await request.json()
    const { franchiseId, quantity, lowStockThreshold } = body

    if (!franchiseId || quantity == null) {
      return NextResponse.json({ error: "Franchise ID and quantity are required" }, { status: 400 })
    }

    const existing = await prisma.productFranchiseStock.findUnique({
      where: { productId_franchiseId: { productId: params.id, franchiseId } },
    })

    let stock
    if (existing) {
      stock = await prisma.productFranchiseStock.update({
        where: { id: existing.id },
        data: {
          quantity: Number(quantity),
          lowStockThreshold: lowStockThreshold != null ? Number(lowStockThreshold) : existing.lowStockThreshold,
        },
        include: { franchise: { select: { id: true, name: true, city: true } } },
      })
    } else {
      stock = await prisma.productFranchiseStock.create({
        data: {
          productId: params.id,
          franchiseId,
          quantity: Number(quantity),
          lowStockThreshold: Number(lowStockThreshold ?? 5),
        },
        include: { franchise: { select: { id: true, name: true, city: true } } },
      })
    }

    await logActivity({
      userId: scope.userId,
      action: "UPDATE",
      entity: "ProductFranchiseStock",
      entityId: params.id,
      details: { franchiseId, quantity },
    })

    return NextResponse.json({ stock })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
