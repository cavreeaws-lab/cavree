import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

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

    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only pending or confirmed orders can be cancelled" },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx: any) => {
      // Restore stock
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { quantity: { increment: item.quantity } },
          })
        } else if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } },
          })
        }
      }

      // Reverse coupon usage
      if (order.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: order.couponCode } })
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { decrement: 1 } },
          })
          await tx.couponUsage.deleteMany({
            where: { couponId: coupon.id, userId: session.userId as string, orderId: order.id },
          })
        }
      }

      // Update order status
      await tx.order.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      })

      // Update payment status if exists
      const payment = await tx.payment.findFirst({ where: { orderId: params.id } })
      if (payment) {
        const paymentStatus = payment.method === "RAZORPAY" && payment.status === "COMPLETED" ? "REFUNDED" : "FAILED"
        await tx.payment.updateMany({
          where: { orderId: params.id },
          data: { status: paymentStatus },
        })
      }

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
