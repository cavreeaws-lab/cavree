import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { validate, createOrderSchema } from "@/lib/validators"
import { sendOrderConfirmationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: any = { userId: session.userId as string }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          payment: true,
          shippingDetail: true,
          franchise: { select: { name: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, 10, 60 * 1000)
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
    const session = await requireAuth()
    const body = await request.json()
    const validation = validate(createOrderSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.errors.flatten().fieldErrors }, { status: 400 })
    }
    const { items, addressId, paymentMethod, couponCode, notes } = validation.data

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.userId as string },
    })
    if (!address) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 })
    }

    // Fetch products to validate and compute totals
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { franchise: { select: { id: true } }, variants: true },
    })

    const productMap = new Map(products.map((p: any) => [p.id, p]))

    let subtotal = 0
    const orderItemsData: any[] = []
    const franchiseIds = new Set<string>()

    for (const item of items as any[]) {
      const product: any = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }

      const variant = item.variantId ? product.variants.find((v: any) => v.id === item.variantId) : null
      if (item.variantId && !variant) {
        return NextResponse.json(
          { error: `Invalid variant for ${product.name}` },
          { status: 400 }
        )
      }
      const availableQuantity = variant ? variant.quantity : product.quantity
      if (availableQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${availableQuantity}` },
          { status: 400 }
        )
      }

      const price = variant?.price ?? product.price
      const total = price * item.quantity
      subtotal += total

      orderItemsData.push({
        name: product.name,
        sku: product.sku,
        price,
        quantity: item.quantity,
        total,
        size: variant?.size || null,
        color: variant?.color || null,
        productId: product.id,
        variantId: item.variantId || null,
      })

      if (product.franchiseId) {
        franchiseIds.add(product.franchiseId)
      }
    }

    if (franchiseIds.size === 0) {
      return NextResponse.json({ error: "No valid franchise for these products" }, { status: 400 })
    }
    if (franchiseIds.size > 1) {
      return NextResponse.json({ error: "Items must be from the same franchise" }, { status: 400 })
    }
    const franchiseId = Array.from(franchiseIds)[0]

    const shipping = subtotal > 5000 ? 0 : 150
    let discount = 0
    let appliedCoupon = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      const now = new Date()
      if (coupon && coupon.isActive && subtotal >= coupon.minOrder) {
        if (coupon.startDate > now) {
          return NextResponse.json({ error: "Coupon is not yet active" }, { status: 400 })
        }
        if (coupon.endDate && coupon.endDate < now) {
          return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
        }
        if (coupon.type === "PERCENTAGE") {
          discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
        } else {
          discount = coupon.value
        }
        appliedCoupon = coupon
      }
    }

    const total = Math.max(0, subtotal + shipping - discount)
    const orderNumber = `ORD-${Date.now()}`

    const order = await prisma.$transaction(async (tx: any) => {
      // Decrement stock with guard to prevent negative inventory under concurrency
      for (const item of items as any[]) {
        if (item.variantId) {
          const result = await tx.productVariant.updateMany({
            where: { id: item.variantId, quantity: { gte: item.quantity } },
            data: { quantity: { decrement: item.quantity } },
          })
          if (result.count === 0) {
            throw new Error(`Insufficient stock for variant ${item.variantId}`)
          }
        } else {
          const result = await tx.product.updateMany({
            where: { id: item.productId, quantity: { gte: item.quantity } },
            data: { quantity: { decrement: item.quantity } },
          })
          if (result.count === 0) {
            throw new Error(`Insufficient stock for product ${item.productId}`)
          }
        }
      }

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usageCount: { increment: 1 } },
        })
      }

      return await tx.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          subtotal,
          discount,
          shipping,
          tax: 0,
          total,
          couponCode: couponCode || null,
          notes: notes || null,
          userId: session.userId as string,
          addressId,
          franchiseId,
          items: { create: orderItemsData },
          payment: {
            create: {
              amount: total,
              method: paymentMethod === "COD" ? "COD" : "RAZORPAY",
              status: "PENDING",
            },
          },
          shippingDetail: {
            create: {
              status: "PENDING",
            },
          },
        },
        include: {
          items: true,
          payment: true,
          shippingDetail: true,
        },
      })
    })

    // Send confirmation email asynchronously (don't block response)
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { email: true },
    })
    if (user?.email) {
      sendOrderConfirmationEmail({
        to: user.email,
        orderNumber: order.orderNumber,
        total: order.total,
      }).catch(console.error)
    }

    return NextResponse.json(
      { order, message: "Order created successfully" },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message?.startsWith("Insufficient stock")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
