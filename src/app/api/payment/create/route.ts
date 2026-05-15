import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { validate, paymentCreateSchema } from "@/lib/validators"
import Razorpay from "razorpay"

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, 10, 60 * 1000)
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
    const session = await requireAuth()
    const body = await request.json()
    const validation = validate(paymentCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { orderId } = validation.data

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.userId as string },
      include: { payment: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const options = {
      amount: Math.round(order.total * 100),
      currency: "INR",
      receipt: order.orderNumber,
    }

    const razorpayOrder = await instance.orders.create(options)

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        method: "RAZORPAY",
        status: "PENDING",
        transactionId: razorpayOrder.id,
        gatewayData: razorpayOrder as any,
      },
      create: {
        orderId: order.id,
        amount: order.total,
        method: "RAZORPAY",
        status: "PENDING",
        transactionId: razorpayOrder.id,
        gatewayData: razorpayOrder as any,
      },
    })

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: "Payment failed" }, { status: 500 })
  }
}
