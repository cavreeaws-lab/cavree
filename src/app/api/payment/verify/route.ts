import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { validate, paymentVerifySchema } from "@/lib/validators"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const validation = validate(paymentVerifySchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data

    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex")

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findFirst({
      where: { transactionId: razorpay_order_id },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.order.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        gatewayData: {
          ...(payment.gatewayData as any || {}),
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      },
    })

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "CONFIRMED" },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
