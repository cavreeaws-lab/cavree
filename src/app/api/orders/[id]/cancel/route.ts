import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: session.userId as string,
      },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending orders can be cancelled" },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx: any) => {
      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        })
      }

      // Update order status
      await tx.order.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      })

      // Update payment status if exists
      await tx.payment.updateMany({
        where: { orderId: params.id },
        data: { status: "REFUNDED" },
      })

      // Update shipping status if exists
      await tx.shipping.updateMany({
        where: { orderId: params.id },
        data: { status: "RETURNED" },
      })
    })

    return NextResponse.json({ message: "Order cancelled successfully" })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Order cancel error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
