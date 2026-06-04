import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const body = await request.json()
    const { productId, variantId, quantity, reason } = body
    if (!productId || typeof quantity !== "number" || !reason) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { franchiseId: true },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    if (scope.isFranchiseScoped && product.franchiseId !== scope.franchiseId) {
      return NextResponse.json({ error: "You do not own this product" }, { status: 403 })
    }

    const adjustment = await prisma.$transaction(async (tx: any) => {
      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { quantity: { increment: quantity } },
        })
      } else {
        await tx.product.update({
          where: { id: productId },
          data: { quantity: { increment: quantity } },
        })
      }

      if (scope.franchiseId) {
        const existingStock = await tx.productFranchiseStock.findUnique({
          where: { productId_franchiseId: { productId, franchiseId: scope.franchiseId } },
        })
        if (existingStock) {
          await tx.productFranchiseStock.update({
            where: { id: existingStock.id },
            data: { quantity: { increment: quantity } },
          })
        }
      }

      return await tx.stockAdjustment.create({
        data: { quantity, reason, productId, variantId: variantId || null, userId: session.userId as string },
      })
    })

    return NextResponse.json({ adjustment }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
