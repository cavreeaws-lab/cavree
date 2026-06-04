import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature")
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET
    if (!signature || !secret) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 400 })
    }

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const razorpayOrderId = event?.payload?.payment?.entity?.order_id || event?.payload?.order?.entity?.id
    const razorpayPaymentId = event?.payload?.payment?.entity?.id

    if (event.event === "payment.captured" && razorpayOrderId) {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: razorpayOrderId },
        include: { order: true },
      })
      if (payment && payment.status !== "COMPLETED") {
        const order = await prisma.order.findUnique({ where: { id: payment.orderId } })
        const orderUpdateData: any = { status: "CONFIRMED" }
        if (order && order.status !== "PENDING" && order.status !== "CONFIRMED") {
          orderUpdateData.status = order.status
        }
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "COMPLETED",
              paidAt: new Date(),
              gatewayData: {
                ...((payment.gatewayData as any) || {}),
                razorpayPaymentId,
                webhookEvent: event.event,
              },
            },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data: orderUpdateData,
          }),
        ])
      }
    }

    if ((event.event === "payment.failed" || event.event === "order.paid") && razorpayOrderId) {
      const status = event.event === "payment.failed" ? "FAILED" : "COMPLETED"
      await prisma.payment.updateMany({
        where: { transactionId: razorpayOrderId },
        data: { status: status as any },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
