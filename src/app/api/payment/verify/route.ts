import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validate, paymentVerifySchema } from "@/lib/validators"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
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

    await prisma.payment.updateMany({
      where: { transactionId: razorpay_order_id },
      data: {
        status: "COMPLETED",
        transactionId: razorpay_payment_id,
        paidAt: new Date(),
      },
    })

    const payment = await prisma.payment.findFirst({
      where: { transactionId: razorpay_payment_id },
    })
    if (payment) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CONFIRMED" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
